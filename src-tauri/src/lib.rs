use font_kit::source::SystemSource;
use reqwest::header::{HeaderMap, RANGE, REFERER, USER_AGENT, CONTENT_LENGTH, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tauri::{
    command, AppHandle, Emitter, Manager, Runtime, State, Window, WebviewWindowBuilder, WebviewUrl,
};
use tokio::io::AsyncWriteExt;
use tauri::utils::config::AppUrl;

// --- Types ---

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub download_path: Option<String>,
    // Add other setting fields as needed
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DownloadOptions {
    pub id: String,
    pub filename: String,
    pub audio_url: String,
    pub is_lossless: bool,
}

#[derive(Debug, Serialize, Clone)]
pub struct DownloadProgress {
    pub id: String,
    pub status: String,
    pub progress: Option<u64>,
    pub downloaded_bytes: Option<u64>,
    pub total_bytes: Option<u64>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HttpInvokePayload {
    pub url: String,
    pub params: Option<serde_json::Value>,
    pub headers: Option<std::collections::HashMap<String, String>>,
    pub body: Option<serde_json::Value>,
    pub timeout: Option<u64>,
}

// Global State for HTTP Client (to persist cookies)
pub struct AppHttpClient(pub reqwest::Client);

// --- Helper Functions ---

fn get_settings_path(app: &AppHandle) -> PathBuf {
    app.path().app_config_dir().unwrap().join("app-settings.json")
}

fn load_settings(app: &AppHandle) -> AppSettings {
    let path = get_settings_path(app);
    if path.exists() {
        let file = File::open(path).ok();
        if let Some(f) = file {
            let reader = std::io::BufReader::new(f);
            if let Ok(settings) = serde_json::from_reader(reader) {
                return settings;
            }
        }
    }
    // Defaults
    AppSettings {
        download_path: Some(app.path().download_dir().unwrap().to_string_lossy().to_string()),
    }
}

// --- Store Commands ---

#[command]
pub async fn get_settings(app: AppHandle) -> Result<AppSettings, String> {
    Ok(load_settings(&app))
}

#[command]
pub async fn set_settings(app: AppHandle, value: AppSettings) -> Result<bool, String> {
    let path = get_settings_path(&app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let file = File::create(path).map_err(|e| e.to_string())?;
    serde_json::to_writer_pretty(file, &value).map_err(|e| e.to_string())?;
    Ok(true)
}

#[command]
pub async fn clear_settings(app: AppHandle) -> Result<bool, String> {
    let path = get_settings_path(&app);
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(true)
}

// --- Dialog Commands ---

#[command]
pub async fn select_directory(app: AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let file_path = app.dialog().file().blocking_pick_folder();
    match file_path {
        Some(path) => Ok(Some(path.to_string())),
        None => Ok(None),
    }
}

#[command]
pub async fn open_directory(app: AppHandle, dir: Option<String>) -> Result<bool, String> {
    let target_dir = if let Some(d) = dir {
        d
    } else {
        load_settings(&app).download_path.unwrap_or_default()
    };
    
    // Using `open` crate or tauri shell plugin
    #[cfg(target_os = "windows")]
    let result = std::process::Command::new("explorer").arg(&target_dir).spawn();
    #[cfg(target_os = "macos")]
    let result = std::process::Command::new("open").arg(&target_dir).spawn();
    #[cfg(target_os = "linux")]
    let result = std::process::Command::new("xdg-open").arg(&target_dir).spawn();

    match result {
        Ok(_) => Ok(true),
        Err(_) => Ok(false), // Mimic electron logic: return false on failure
    }
}

// --- Font Commands ---

#[command]
pub async fn get_fonts() -> Result<Vec<String>, String> {
    let source = SystemSource::new();
    let fonts = source.all_fonts().map_err(|e| e.to_string())?;
    let font_families: Vec<String> = fonts
        .into_iter()
        .filter_map(|handle| handle.family_name().into_iter().next())
        .collect::<std::collections::HashSet<_>>() // Deduplicate
        .into_iter()
        .collect();
    Ok(font_families)
}

// --- Download Commands ---

#[command]
pub async fn check_file_exists(app: AppHandle, filename: String) -> Result<bool, String> {
    let settings = load_settings(&app);
    let download_dir = PathBuf::from(settings.download_path.unwrap_or_default());
    Ok(download_dir.join(filename).exists())
}

#[command]
pub async fn start_download(
    app: AppHandle,
    client: State<'_, AppHttpClient>,
    options: DownloadOptions,
) -> Result<serde_json::Value, String> {
    let settings = load_settings(&app);
    let download_dir = PathBuf::from(settings.download_path.unwrap_or_default());
    fs::create_dir_all(&download_dir).map_err(|e| e.to_string())?;
    
    let output_path = download_dir.join(&options.filename);
    let temp_dir = app.path().temp_dir().unwrap().join("biu-downloads");
    fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;
    let temp_audio_path = temp_dir.join(format!("{}.audio.tmp", options.id));

    let options_clone = options.id.clone();
    let app_handle = app.clone();

    // Spawn download task
    tauri::async_runtime::spawn(async move {
        let emit_progress = |status: &str, progress: Option<u64>, downloaded: Option<u64>, total: Option<u64>, error: Option<String>| {
            let _ = app_handle.emit("download:progress", DownloadProgress {
                id: options_clone.clone(),
                status: status.to_string(),
                progress,
                downloaded_bytes: downloaded,
                total_bytes: total,
                error,
            });
        };

        // Resume logic
        let mut start_byte = 0;
        if temp_audio_path.exists() {
             if let Ok(metadata) = fs::metadata(&temp_audio_path) {
                 start_byte = metadata.len();
             }
        }

        let mut headers = HeaderMap::new();
        headers.insert(REFERER, "https://www.bilibili.com".parse().unwrap());
        headers.insert(USER_AGENT, "Mozilla/5.0 ...".parse().unwrap()); // Use your UserAgent constant
        if start_byte > 0 {
            headers.insert(RANGE, format!("bytes={}-", start_byte).parse().unwrap());
        }

        let res_result = client.0.get(&options.audio_url).headers(headers).send().await;
        
        match res_result {
            Ok(res) => {
                if !res.status().is_success() {
                     emit_progress("failed", None, None, None, Some(format!("HTTP {}", res.status())));
                     return;
                }

                let total_size = res.content_length().map(|l| l + start_byte);
                let mut stream = res.bytes_stream();
                
                let mut file = tokio::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&temp_audio_path)
                    .await
                    .expect("Failed to open temp file");

                let mut downloaded = start_byte;
                
                emit_progress("downloading", Some(0), Some(downloaded), total_size, None);

                use futures_util::StreamExt;
                while let Some(item) = stream.next().await {
                    if let Ok(chunk) = item {
                         if let Err(_) = file.write_all(&chunk).await {
                             emit_progress("failed", None, None, None, Some("Write error".into()));
                             return;
                         }
                         downloaded += chunk.len() as u64;
                         
                         let pct = if let Some(total) = total_size {
                             (downloaded as f64 / total as f64 * 100.0) as u64
                         } else {
                             0
                         };
                         emit_progress("downloading", Some(pct), Some(downloaded), total_size, None);
                    }
                }
                
                // Merging/Conversion phase
                emit_progress("merging", None, None, None, None);

                if options.is_lossless {
                     if let Err(e) = fs::rename(&temp_audio_path, &output_path) {
                         // Fallback to copy if rename fails (e.g. cross-device)
                         fs::copy(&temp_audio_path, &output_path).unwrap();
                         fs::remove_file(&temp_audio_path).unwrap();
                     }
                } else {
                    // Call FFMPEG using tauri::process::Command (assumes ffmpeg is sidecar or in path)
                    // Note: You must define 'ffmpeg' in tauri.conf.json allowlist > shell > scope
                    let status = tauri::process::Command::new("ffmpeg")
                        .args(&[
                            "-y", "-i", temp_audio_path.to_str().unwrap(),
                            "-vn", "-codec:a", "libmp3lame", "-q:a", "2",
                            output_path.to_str().unwrap()
                        ])
                        .output()
                        .await;

                    match status {
                         Ok(output) if output.status.success() => {
                             let _ = fs::remove_file(&temp_audio_path);
                         },
                         _ => {
                             emit_progress("failed", None, None, None, Some("FFmpeg failed".into()));
                             return;
                         }
                    }
                }

                emit_progress("completed", Some(100), None, None, None);
            },
            Err(e) => {
                emit_progress("failed", None, None, None, Some(e.to_string()));
            }
        }
    });

    Ok(serde_json::json!({ "success": true }))
}

// --- HTTP/Cookie Commands ---

#[command]
pub async fn get_cookie(client: State<'_, AppHttpClient>, key: String) -> Result<Option<String>, String> {
    // Note: This relies on the reqwest cookie store being populated. 
    // If you need access to the WebView's cookies, use tauri_plugin_http specific commands or WebView logic.
    // For this refactor, we assume the shared cookie jar in AppHttpClient is used.
    let url = "https://www.bilibili.com".parse::<reqwest::Url>().unwrap();
    // Accessing the jar is tricky with standard reqwest::Client without Arc wrapper access or a specific crate helper,
    // usually in Tauri V2 you might just rely on the plugin-http automatic cookie handling for webviews.
    // Here is a placeholder for retrieving from the client's jar if exposed, otherwise logic mimics electron session.
    Ok(None) // Placeholder: Implement specific cookie jar logic or use tauri_plugin_http::get_cookie
}

#[command]
pub async fn http_get(
    client: State<'_, AppHttpClient>,
    payload: HttpInvokePayload,
) -> Result<serde_json::Value, String> {
    let mut req = client.0.get(&payload.url);
    if let Some(headers) = payload.headers {
        let mut hmap = HeaderMap::new();
        for (k, v) in headers {
            if let Ok(hname) = k.parse() {
                if let Ok(hval) = v.parse() {
                    hmap.insert(hname, hval);
                }
            }
        }
        req = req.headers(hmap);
    }
    if let Some(params) = payload.params {
        req = req.query(&params);
    }
    
    let res = req.send().await.map_err(|e| e.to_string())?;
    // Return just data to match electron implementation
    let data: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    Ok(data)
}

#[command]
pub async fn http_post(
    client: State<'_, AppHttpClient>,
    payload: HttpInvokePayload,
) -> Result<serde_json::Value, String> {
    let mut req = client.0.post(&payload.url);
    if let Some(headers) = payload.headers {
        let mut hmap = HeaderMap::new();
        for (k, v) in headers {
            if let Ok(hname) = k.parse() {
                if let Ok(hval) = v.parse() {
                    hmap.insert(hname, hval);
                }
            }
        }
        req = req.headers(hmap);
    }
    if let Some(body) = payload.body {
        req = req.json(&body);
    }
    
    let res = req.send().await.map_err(|e| e.to_string())?;
    let data: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    Ok(data)
}

// --- Window & Player Commands ---

#[command]
pub async fn update_playback_state(app: AppHandle, state: serde_json::Value) -> Result<(), String> {
    // Forward state to other windows (e.g., mini player)
    app.emit("playback-state-update", state).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn switch_to_mini(app: AppHandle, window: Window) -> Result<(), String> {
    if let Some(main_win) = app.get_webview_window("main") {
        main_win.hide().unwrap();
    }
    
    // Create mini player window if not exists
    if app.get_webview_window("mini").is_none() {
        let mini = WebviewWindowBuilder::new(
            &app,
            "mini",
            WebviewUrl::App("mini-player.html".into()), // Assuming different route
        )
        .title("Mini Player")
        .inner_size(300.0, 300.0)
        .always_on_top(true)
        .decorations(false)
        .build()
        .map_err(|e| e.to_string())?;
    } else {
        if let Some(mini) = app.get_webview_window("mini") {
            mini.show().unwrap();
        }
    }
    Ok(())
}

#[command]
pub async fn switch_to_main(app: AppHandle) -> Result<(), String> {
    if let Some(mini_win) = app.get_webview_window("mini") {
        mini_win.close().unwrap();
    }
    if let Some(main_win) = app.get_webview_window("main") {
        main_win.show().unwrap();
        main_win.set_focus().unwrap();
    }
    Ok(())
}

#[command]
pub fn minimize_window(window: Window) {
    let _ = window.minimize();
}

#[command]
pub fn toggle_maximize_window(window: Window) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
        let _ = window.emit("window:unmaximize", ());
    } else {
        let _ = window.maximize();
        let _ = window.emit("window:maximize", ());
    }
}

#[command]
pub fn close_window(window: Window) {
    let _ = window.close();
}

#[command]
pub fn is_maximized(window: Window) -> bool {
    window.is_maximized().unwrap_or(false)
}

#[command]
pub fn is_full_screen(window: Window) -> bool {
    window.is_fullscreen().unwrap_or(false)
}

// --- Entry Point ---

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize HTTP Client with Cookie Store
    let jar = std::sync::Arc::new(reqwest::cookie::Jar::default());
    let client = reqwest::Client::builder()
        .cookie_provider(jar)
        .user_agent("Mozilla/5.0 ...") // Set your default UA
        .build()
        .unwrap();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .manage(AppHttpClient(client))
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            clear_settings,
            select_directory,
            open_directory,
            get_fonts,
            check_file_exists,
            start_download,
            get_cookie,
            http_get,
            http_post,
            update_playback_state,
            switch_to_mini,
            switch_to_main,
            minimize_window,
            toggle_maximize_window,
            close_window,
            is_maximized,
            is_full_screen
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}