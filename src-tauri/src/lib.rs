use font_kit::source::SystemSource;
use futures_util::StreamExt;
use reqwest::header::{
    HeaderMap, HeaderName, ACCEPT_RANGES, CONTENT_LENGTH, CONTENT_RANGE, CONTENT_TYPE, COOKIE,
    LOCATION, RANGE, REFERER, USER_AGENT,
};
use reqwest::Method;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder, Window};
use tauri_plugin_shell::ShellExt;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpListener;

// --- Constants ---
const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// --- Types ---

// Store the dynamic port of our local proxy
pub struct ProxyPort(Arc<Mutex<u16>>);

// 1. Define the persistent state for tasks
#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MediaDownloadTaskState {
    pub id: String,
    // Base fields from request
    pub output_file_type: String,
    pub title: String,
    pub cover: Option<String>,
    pub bvid: Option<String>,
    pub cid: Option<String>,
    pub sid: Option<String>,
    // Extended fields for status
    pub audio_codecs: Option<String>,
    pub audio_bandwidth: Option<u64>,
    pub video_resolution: Option<String>,
    pub video_frame_rate: Option<String>,
    pub save_path: Option<String>,
    pub total_bytes: Option<u64>,
    pub download_progress: Option<u64>,
    pub merge_progress: Option<u64>,
    pub convert_progress: Option<u64>,
    pub error: Option<String>,
    pub status: String, // "pending", "downloading", "merging", "converting", "completed", "failed"
}

// 2. Define the Store Container
pub struct TaskStore(Arc<Mutex<Vec<MediaDownloadTaskState>>>);

impl TaskStore {
    fn new() -> Self {
        Self(Arc::new(Mutex::new(Vec::new())))
    }

    // Helper to update a task safely
    fn update_task<F>(&self, id: &str, f: F)
    where
        F: FnOnce(&mut MediaDownloadTaskState),
    {
        let mut tasks = self.0.lock().unwrap();
        if let Some(task) = tasks.iter_mut().find(|t| t.id == id) {
            f(task);
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub download_path: Option<String>,
    #[serde(flatten)]
    pub extra: std::collections::HashMap<String, serde_json::Value>,
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

// Global State for HTTP Client
pub struct AppHttpClient(pub reqwest::Client);

// --- Helper Functions ---

fn get_settings_path(app: &AppHandle) -> PathBuf {
    app.path()
        .app_config_dir()
        .unwrap()
        .join("app-settings.json")
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
        download_path: Some(
            app.path()
                .download_dir()
                .unwrap()
                .to_string_lossy()
                .to_string(),
        ),
        extra: std::collections::HashMap::new(),
    }
}

// --- Proxy Server Logic ---

async fn run_proxy_server(port_state: Arc<Mutex<u16>>) {
    // Bind to a random available port on localhost
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .expect("Failed to bind proxy");
    let port = listener.local_addr().unwrap().port();

    // Save the port so frontend can ask for it
    {
        let mut p = port_state.lock().unwrap();
        *p = port;
    }
    println!("Local Audio Proxy running on port: {}", port);

    let client = reqwest::Client::builder()
        .user_agent(DEFAULT_USER_AGENT)
        .build()
        .unwrap();

    loop {
        if let Ok((mut socket, _)) = listener.accept().await {
            let client_clone = client.clone();
            tokio::spawn(async move {
                let mut buf = [0; 2048];
                // Read the HTTP request (just enough to get headers)
                if let Ok(n) = socket.read(&mut buf).await {
                    if n == 0 {
                        return;
                    }
                    let request_str = String::from_utf8_lossy(&buf[..n]);

                    // 1. Parse URL parameters manually to avoid dependencies
                    // Expecting: GET /?url=...&referer=... HTTP/1.1
                    let first_line = request_str.lines().next().unwrap_or("");
                    if !first_line.contains("GET") {
                        return;
                    }

                    // Extract query params
                    let target_url = extract_query_param(&request_str, "url=");
                    let referer_url = extract_query_param(&request_str, "referer=");

                    if let Some(url) = target_url {
                        let decoded_url =
                            urlencoding::decode(&url).unwrap_or(std::borrow::Cow::Borrowed(&url));
                        let decoded_referer = if let Some(r) = referer_url {
                            urlencoding::decode(&r)
                                .unwrap_or(std::borrow::Cow::Borrowed("https://www.bilibili.com/"))
                                .into_owned()
                        } else {
                            "https://www.bilibili.com/".to_string()
                        };

                        // 2. Extract Range Header
                        let range_header = request_str
                            .lines()
                            .find(|l| l.to_lowercase().starts_with("range:"))
                            .map(|l| l.split(':').nth(1).unwrap_or("").trim());

                        // 3. Prepare Request to Bilibili
                        let mut req_builder = client_clone
                            .get(decoded_url.as_ref())
                            .header(REFERER, decoded_referer);

                        if let Some(range) = range_header {
                            req_builder = req_builder.header(RANGE, range);
                        }

                        // 4. Stream Response back to Socket
                        match req_builder.send().await {
                            Ok(res) => {
                                let status_line = format!("HTTP/1.1 {} OK\r\n", res.status());
                                let _ = socket.write_all(status_line.as_bytes()).await;

                                // Forward Headers
                                let mut headers_str = String::new();
                                headers_str.push_str("Access-Control-Allow-Origin: *\r\n");
                                headers_str.push_str("Connection: close\r\n"); // Keep it simple

                                if let Some(ct) = res.headers().get(CONTENT_TYPE) {
                                    headers_str.push_str(&format!(
                                        "Content-Type: {}\r\n",
                                        ct.to_str().unwrap_or("application/octet-stream")
                                    ));
                                }
                                if let Some(cl) = res.headers().get(CONTENT_LENGTH) {
                                    headers_str.push_str(&format!(
                                        "Content-Length: {}\r\n",
                                        cl.to_str().unwrap_or("0")
                                    ));
                                }
                                if let Some(cr) = res.headers().get(CONTENT_RANGE) {
                                    headers_str.push_str(&format!(
                                        "Content-Range: {}\r\n",
                                        cr.to_str().unwrap_or("")
                                    ));
                                }
                                headers_str.push_str("Accept-Ranges: bytes\r\n\r\n");

                                let _ = socket.write_all(headers_str.as_bytes()).await;

                                // Pipe Body
                                let mut stream = res.bytes_stream();
                                while let Some(chunk_result) = stream.next().await {
                                    if let Ok(chunk) = chunk_result {
                                        if let Err(_) = socket.write_all(&chunk).await {
                                            break; // Client closed connection
                                        }
                                    }
                                }
                            }
                            Err(_) => {
                                let _ = socket
                                    .write_all(b"HTTP/1.1 500 Internal Server Error\r\n\r\n")
                                    .await;
                            }
                        }
                    }
                }
            });
        }
    }
}

// Helper to extract param from "key=value" string in a request
fn extract_query_param(request: &str, key: &str) -> Option<String> {
    if let Some(start) = request.find(key) {
        let rest = &request[start + key.len()..];
        let end = rest.find(|c| c == '&' || c == ' ').unwrap_or(rest.len());
        return Some(rest[..end].to_string());
    }
    None
}

// --- App/Updater Commands ---

#[tauri::command]
fn get_app_version(app: AppHandle) -> String {
    app.package_info().version.to_string()
}

#[tauri::command]
async fn check_app_update(_app: AppHandle) -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "isUpdateAvailable": false,
        "latestVersion": "",
        "releaseNotes": ""
    }))
}

#[tauri::command]
async fn download_app_update() -> Result<(), String> {
    Err("Auto-update not configured".to_string())
}

#[tauri::command]
async fn quit_and_install(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
async fn open_installer_directory(app: AppHandle) -> Result<bool, String> {
    let path = app.path().download_dir().unwrap_or_default();
    open_directory(app, Some(path.to_string_lossy().to_string())).await
}

// --- Store Commands ---

#[tauri::command]
async fn get_settings(app: AppHandle) -> Result<AppSettings, String> {
    Ok(load_settings(&app))
}

#[tauri::command]
async fn set_settings(app: AppHandle, payload: AppSettings) -> Result<bool, String> {
    let path = get_settings_path(&app);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let file = File::create(path).map_err(|e| e.to_string())?;
    serde_json::to_writer_pretty(file, &payload).map_err(|e| e.to_string())?;
    Ok(true)
}

fn get_store_path(app: &AppHandle, key: &str) -> PathBuf {
    app.path()
        .app_config_dir()
        .unwrap()
        .join(format!("{}.json", key))
}

#[tauri::command]
async fn get_store(app: AppHandle, key: String) -> Result<serde_json::Value, String> {
    let path = get_store_path(&app, &key);
    if path.exists() {
        let file = File::open(path).map_err(|e| e.to_string())?;
        let reader = std::io::BufReader::new(file);
        let data: serde_json::Value = serde_json::from_reader(reader).map_err(|e| e.to_string())?;
        Ok(data)
    } else {
        Ok(serde_json::Value::Null)
    }
}

#[tauri::command]
async fn set_store(app: AppHandle, key: String, data: serde_json::Value) -> Result<(), String> {
    let path = get_store_path(&app, &key);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let file = File::create(path).map_err(|e| e.to_string())?;
    serde_json::to_writer_pretty(file, &data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn clear_store(app: AppHandle, key: String) -> Result<(), String> {
    let path = get_store_path(&app, &key);
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn clear_settings(app: AppHandle) -> Result<bool, String> {
    let path = get_settings_path(&app);
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    Ok(true)
}

// --- Dialog Commands ---

#[tauri::command]
async fn select_directory(app: AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    let file_path = app.dialog().file().blocking_pick_folder();
    match file_path {
        Some(path) => Ok(Some(path.to_string())),
        None => Ok(None),
    }
}

#[tauri::command]
async fn open_directory(app: AppHandle, path: Option<String>) -> Result<bool, String> {
    let target_dir = if let Some(d) = path {
        d
    } else {
        load_settings(&app).download_path.unwrap_or_default()
    };
    println!("Path: {}", &target_dir);
    #[cfg(target_os = "windows")]
    let result = std::process::Command::new("explorer")
        .arg(&target_dir)
        .spawn();
    #[cfg(target_os = "macos")]
    let result = std::process::Command::new("open").arg(&target_dir).spawn();
    #[cfg(target_os = "linux")]
    let result = std::process::Command::new("xdg-open")
        .arg(&target_dir)
        .spawn();

    match result {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

// --- Font Commands ---

#[tauri::command]
async fn get_fonts() -> Result<Vec<serde_json::Value>, String> {
    let source = SystemSource::new();
    let fonts = source.all_fonts().map_err(|e| e.to_string())?;
    let font_infos: Vec<serde_json::Value> = fonts
        .into_iter()
        .filter_map(|handle| {
            handle.load().ok().map(|f| {
                serde_json::json!({
                    "name": f.full_name(),
                    "familyName": f.family_name()
                })
            })
        })
        .collect::<Vec<_>>();
    Ok(font_infos)
}

// --- Download Commands ---

#[tauri::command]
async fn check_file_exists(app: AppHandle, filename: String) -> Result<bool, String> {
    let settings = load_settings(&app);
    let download_dir = PathBuf::from(settings.download_path.unwrap_or_default());
    Ok(download_dir.join(filename).exists())
}

#[tauri::command]
async fn start_download(
    app: AppHandle,
    client: State<'_, AppHttpClient>,
    params: DownloadOptions,
) -> Result<serde_json::Value, String> {
    // Legacy simple download without state tracking
    spawn_download_task(app, client.0.clone(), params);
    Ok(serde_json::json!({ "success": true }))
}

// --- NEW: Command to get the list ---
#[tauri::command]
async fn get_media_download_task_list(
    state: State<'_, TaskStore>,
) -> Result<Vec<MediaDownloadTaskState>, String> {
    let tasks = state.0.lock().unwrap();
    Ok(tasks.clone())
}

// Input struct for creating a task (simpler than the State struct)
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaDownloadRequest {
    pub output_file_type: String,
    pub title: String,
    pub cover: Option<String>,
    pub bvid: Option<String>,
    pub cid: Option<String>,
    pub sid: Option<String>,
}

#[tauri::command]
async fn add_media_download_task(
    app: AppHandle,
    client: State<'_, AppHttpClient>,
    store: State<'_, TaskStore>, // State must be managed in run()
    task: MediaDownloadRequest,
) -> Result<serde_json::Value, String> {
    // Validate inputs
    let bvid = task.bvid.clone().ok_or("Missing bvid")?;
    let cid = task.cid.clone().ok_or("Missing cid")?;

    // 1. Fetch the Bilibili Play URL
    let api_url = format!(
        "https://api.bilibili.com/x/player/playurl?bvid={}&cid={}&qn=80&fnval=16",
        bvid, cid
    );

    let res = client
        .0
        .get(&api_url)
        .header(REFERER, "https://www.bilibili.com")
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    let json: BiliPlayUrlResponse = res.json().await.map_err(|e| format!("JSON error: {}", e))?;

    if json.code != 0 {
        return Err(format!("Bilibili API Error Code: {}", json.code));
    }

    // 2. Extract Audio URL
    let audio_url = if let Some(data) = &json.data {
        if let Some(dash) = &data.dash {
            dash.audio
                .as_ref()
                .and_then(|audios| audios.first().map(|a| a.base_url.clone()))
        } else if let Some(durls) = &data.durl {
            durls.first().map(|d| d.url.clone())
        } else {
            None
        }
    } else {
        None
    }
    .ok_or("No audio stream found in API response")?;

    // 3. Determine Filename
    let ext = if task.output_file_type == "mp3" {
        "mp3"
    } else {
        "m4a"
    };

    let safe_title: String = task
        .title
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == ' ' || *c == '-' || *c == '_')
        .collect();
    let filename = format!("{}.{}", safe_title, ext);
    let task_id = uuid::Uuid::new_v4().to_string();

    // 4. Initialize State Entry and push to Store
    let new_task_state = MediaDownloadTaskState {
        id: task_id.clone(),
        output_file_type: task.output_file_type.clone(),
        title: task.title.clone(),
        cover: task.cover.clone(),
        bvid: task.bvid.clone(),
        cid: task.cid.clone(),
        sid: task.sid.clone(),
        audio_codecs: None,
        audio_bandwidth: None,
        video_resolution: None,
        video_frame_rate: None,
        save_path: Some(filename.clone()),
        total_bytes: None,
        download_progress: Some(0),
        merge_progress: None,
        convert_progress: None,
        error: None,
        status: "pending".to_string(),
    };

    {
        let mut tasks = store.0.lock().unwrap();
        tasks.push(new_task_state.clone());

        app.emit(
            "download:list-sync",
            serde_json::json!({
                "type": "full",
                "data": *tasks
            }),
        )
        .map_err(|e| e.to_string())?;
    }

    // 5. Construct Options & Start
    let options = DownloadOptions {
        id: task_id,
        filename,
        audio_url,
        is_lossless: task.output_file_type != "mp3",
    };

    spawn_download_task(app, client.0.clone(), options);

    Ok(serde_json::json!({ "success": true, "message": "Download started" }))
}

// Bilibili API Response Helper Structs
#[derive(Debug, Deserialize)]
struct BiliPlayUrlResponse {
    code: i32,
    data: Option<BiliPlayUrlData>,
}

#[derive(Debug, Deserialize)]
struct BiliPlayUrlData {
    dash: Option<BiliDashData>,
    durl: Option<Vec<BiliDurlData>>,
}

#[derive(Debug, Deserialize)]
struct BiliDashData {
    audio: Option<Vec<BiliDashMedia>>,
}

#[derive(Debug, Deserialize)]
struct BiliDashMedia {
    base_url: String,
}

#[derive(Debug, Deserialize)]
struct BiliDurlData {
    url: String,
}

fn spawn_download_task(app: AppHandle, client: reqwest::Client, params: DownloadOptions) {
    let settings = load_settings(&app);
    let download_dir = PathBuf::from(settings.download_path.unwrap_or_default());

    // Ensure directories exist
    if let Err(_) = fs::create_dir_all(&download_dir) {
        return;
    }

    let output_path = download_dir.join(&params.filename);
    let temp_dir = app.path().temp_dir().unwrap().join("biu-downloads");
    if let Err(_) = fs::create_dir_all(&temp_dir) {
        return;
    }

    let temp_audio_path = temp_dir.join(format!("{}.audio.tmp", params.id));

    let options_clone = params.id.clone();
    let is_lossless = params.is_lossless;
    let audio_url = params.audio_url.clone();
    let app_handle = app.clone();

    tauri::async_runtime::spawn(async move {
        // Closure to update both UI events and Backend State
        let update_status = |status: &str,
                             progress: Option<u64>,
                             downloaded: Option<u64>,
                             total: Option<u64>,
                             error: Option<String>| {
            // 1. Emit legacy UI Event (Optional, keep if other components use it)
            let _ = app_handle.emit(
                "download:progress",
                DownloadProgress {
                    id: options_clone.clone(),
                    status: status.to_string(),
                    progress,
                    downloaded_bytes: downloaded,
                    total_bytes: total,
                    error: error.clone(),
                },
            );

            // 2. Update Backend Store AND Emit Sync Event
            if let Some(store) = app_handle.try_state::<TaskStore>() {
                // We manually lock here instead of using helper so we can get the updated task to emit
                let mut tasks = store.0.lock().unwrap();
                if let Some(t) = tasks.iter_mut().find(|t| t.id == options_clone) {
                    t.status = status.to_string();
                    if let Some(p) = progress {
                        t.download_progress = Some(p);
                    }
                    if let Some(tot) = total {
                        t.total_bytes = Some(tot);
                    }
                    if let Some(err) = &error {
                        t.error = Some(err.clone());
                    }

                    if status == "merging" {
                        t.merge_progress = Some(50);
                    }
                    if status == "converting" {
                        t.convert_progress = Some(10);
                    }
                    if status == "completed" {
                        t.download_progress = Some(100);
                        t.merge_progress = Some(100);
                        t.convert_progress = Some(100);
                    }

                    // Clone the updated task to send in the event
                    let updated_task_data = t.clone();

                    // Release lock before emitting (good practice, though emit is async usually)
                    drop(tasks);

                    // Emit UPDATE sync event
                    let _ = app_handle.emit(
                        "download:list-sync",
                        serde_json::json!({
                            "type": "update",
                            "data": [updated_task_data] // Send array of updates
                        }),
                    );
                }
            }
        };

        let mut start_byte = 0;
        if temp_audio_path.exists() {
            if let Ok(metadata) = fs::metadata(&temp_audio_path) {
                start_byte = metadata.len();
            }
        }

        let mut headers = HeaderMap::new();
        headers.insert(REFERER, "https://www.bilibili.com".parse().unwrap());
        headers.insert(USER_AGENT, DEFAULT_USER_AGENT.parse().unwrap());
        if start_byte > 0 {
            headers.insert(RANGE, format!("bytes={}-", start_byte).parse().unwrap());
        }

        let res_result = client.get(&audio_url).headers(headers).send().await;

        match res_result {
            Ok(res) => {
                if !res.status().is_success() {
                    update_status(
                        "failed",
                        None,
                        None,
                        None,
                        Some(format!("HTTP {}", res.status())),
                    );
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

                update_status("downloading", Some(0), Some(downloaded), total_size, None);

                while let Some(item) = stream.next().await {
                    if let Ok(chunk) = item {
                        if let Err(_) = file.write_all(&chunk).await {
                            update_status("failed", None, None, None, Some("Write error".into()));
                            return;
                        }
                        downloaded += chunk.len() as u64;

                        let pct = if let Some(total) = total_size {
                            (downloaded as f64 / total as f64 * 100.0) as u64
                        } else {
                            0
                        };
                        update_status("downloading", Some(pct), Some(downloaded), total_size, None);
                    }
                }

                update_status("merging", None, None, None, None);

                if is_lossless {
                    // If lossless/direct, just move the file
                    if let Err(_e) = fs::rename(&temp_audio_path, &output_path) {
                        let _ = fs::copy(&temp_audio_path, &output_path);
                        let _ = fs::remove_file(&temp_audio_path);
                    }
                } else {
                    // Convert to MP3
                    update_status("converting", None, None, None, None);

                    let shell = app_handle.shell();
                    let status = shell
                        .command("ffmpeg")
                        .args(&[
                            "-y",
                            "-i",
                            temp_audio_path.to_str().unwrap(),
                            "-vn",
                            "-codec:a",
                            "libmp3lame",
                            "-q:a",
                            "2",
                            output_path.to_str().unwrap(),
                        ])
                        .output()
                        .await;

                    match status {
                        Ok(output) if output.status.success() => {
                            let _ = fs::remove_file(&temp_audio_path);
                        }
                        _ => {
                            update_status("failed", None, None, None, Some("FFmpeg failed".into()));
                            return;
                        }
                    }
                }

                update_status("completed", Some(100), None, None, None);
            }
            Err(e) => {
                update_status("failed", None, None, None, Some(e.to_string()));
            }
        }
    });
}

#[tauri::command]
async fn clear_media_download_task_list(
    app: AppHandle,
    store: State<'_, TaskStore>,
) -> Result<(), String> {
    let mut tasks = store.0.lock().unwrap();
    tasks.clear();

    // Emit full sync event with empty list
    app.emit(
        "download:list-sync",
        serde_json::json!({
            "type": "full",
            "data": Vec::<MediaDownloadTaskState>::new()
        }),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// --- HTTP/Cookie Commands ---
#[tauri::command]
async fn http_request(
    client: State<'_, AppHttpClient>,
    method: String,
    url: String,
    body: Option<serde_json::Value>,
    options: Option<HttpInvokePayload>,
) -> Result<serde_json::Value, String> {
    let req_method = Method::from_str(&method.to_uppercase()).map_err(|e| e.to_string())?;
    let mut req = client.0.request(req_method, &url);
    let mut is_form = false;

    if let Some(payload) = options {
        if let Some(headers) = payload.headers {
            let mut hmap = HeaderMap::new();
            for (k, v) in headers {
                if let Ok(hname) = k.parse::<HeaderName>() {
                    if let Ok(hval) = v.parse::<tauri::http::HeaderValue>() {
                        if hname == CONTENT_TYPE
                            && hval
                                .to_str()
                                .unwrap_or("")
                                .contains("application/x-www-form-urlencoded")
                        {
                            is_form = true;
                        }
                        hmap.insert(hname, hval);
                    }
                }
            }
            req = req.headers(hmap);
        }
        if let Some(params) = payload.params {
            req = req.query(&params);
        }
        if let Some(timeout_ms) = payload.timeout {
            req = req.timeout(std::time::Duration::from_millis(timeout_ms));
        }
    }

    if let Some(b) = body {
        if is_form {
            req = req.form(&b);
        } else {
            req = req.json(&b);
        }
    }

    let res = req.send().await.map_err(|e| e.to_string())?;
    let text_res = res.text().await.map_err(|e| e.to_string())?;

    match serde_json::from_str::<serde_json::Value>(&text_res) {
        Ok(json) => Ok(json),
        Err(_) => Ok(serde_json::Value::String(text_res)),
    }
}

#[tauri::command]
async fn get_cookie(
    _client: State<'_, AppHttpClient>,
    _key: String,
) -> Result<Option<String>, String> {
    Ok(None)
}

#[tauri::command]
async fn http_get(
    client: State<'_, AppHttpClient>,
    url: String,
    options: Option<HttpInvokePayload>,
) -> Result<serde_json::Value, String> {
    let mut req = client.0.get(&url);
    if let Some(payload) = options {
        if let Some(headers) = payload.headers {
            let mut hmap = HeaderMap::new();
            for (k, v) in headers {
                if let Ok(hname) = k.parse::<HeaderName>() {
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
    }

    let res = req.send().await.map_err(|e| e.to_string())?;
    let text_res = res.text().await.map_err(|e| e.to_string())?;
    match serde_json::from_str::<serde_json::Value>(&text_res) {
        Ok(json) => Ok(json),
        Err(_) => Ok(serde_json::Value::String(text_res)),
    }
}

#[tauri::command]
async fn http_post(
    client: State<'_, AppHttpClient>,
    url: String,
    body: Option<serde_json::Value>,
    options: Option<HttpInvokePayload>,
) -> Result<serde_json::Value, String> {
    let mut req = client.0.post(&url);
    let mut is_form = false;

    if let Some(payload) = options {
        if let Some(headers) = payload.headers {
            let mut hmap = HeaderMap::new();
            for (k, v) in headers {
                if let Ok(hname) = k.parse::<HeaderName>() {
                    if let Ok(hval) = v.parse::<tauri::http::HeaderValue>() {
                        if hname == CONTENT_TYPE
                            && hval
                                .to_str()
                                .unwrap_or("")
                                .contains("application/x-www-form-urlencoded")
                        {
                            is_form = true;
                        }
                        hmap.insert(hname, hval);
                    }
                }
            }
            req = req.headers(hmap);
        }
        if let Some(params) = payload.params {
            req = req.query(&params);
        }
    }

    if let Some(b) = body {
        if is_form {
            req = req.form(&b);
        } else {
            req = req.json(&b);
        }
    }

    let res = req.send().await.map_err(|e| e.to_string())?;
    let text_res = res.text().await.map_err(|e| e.to_string())?;
    match serde_json::from_str::<serde_json::Value>(&text_res) {
        Ok(json) => Ok(json),
        Err(_) => Ok(serde_json::Value::String(text_res)),
    }
}

// --- Proxy Command ---
#[tauri::command]
async fn get_proxy_port(state: State<'_, ProxyPort>) -> Result<u16, String> {
    let port = *state.0.lock().unwrap();
    if port == 0 {
        return Err("Proxy not ready".into());
    }
    Ok(port)
}

// --- Window & Player Commands ---

#[tauri::command]
async fn update_playback_state(app: AppHandle, is_playing: bool) -> Result<(), String> {
    app.emit("playback-state-update", is_playing)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn switch_to_mini(app: AppHandle, _window: Window) -> Result<(), String> {
    if let Some(main_win) = app.get_webview_window("main") {
        main_win.hide().unwrap();
    }

    if app.get_webview_window("mini").is_none() {
        let _mini = WebviewWindowBuilder::new(
            &app,
            "mini",
            WebviewUrl::App("index.html#/mini-player".into()),
        )
        .title("Mini Player")
        .inner_size(300.0, 300.0)
        .always_on_top(true)
        .decorations(false)
        .transparent(true)
        .build()
        .map_err(|e| e.to_string())?;
    } else {
        if let Some(mini) = app.get_webview_window("mini") {
            mini.show().unwrap();
        }
    }
    Ok(())
}

#[tauri::command]
async fn switch_to_main(app: AppHandle) -> Result<(), String> {
    if let Some(mini_win) = app.get_webview_window("mini") {
        mini_win.close().unwrap();
    }
    if let Some(main_win) = app.get_webview_window("main") {
        main_win.show().unwrap();
        main_win.set_focus().unwrap();
    }
    Ok(())
}

#[tauri::command]
fn minimize_window(window: Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn toggle_maximize_window(window: Window) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
        let _ = window.emit("window:unmaximize", ());
    } else {
        let _ = window.maximize();
        let _ = window.emit("window:maximize", ());
    }
}

#[tauri::command]
fn close_window(window: Window) {
    let _ = window.close();
}

#[tauri::command]
fn is_maximized(window: Window) -> bool {
    window.is_maximized().unwrap_or(false)
}

#[tauri::command]
fn is_full_screen(window: Window) -> bool {
    window.is_fullscreen().unwrap_or(false)
}

// --- Entry Point ---

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let jar = std::sync::Arc::new(reqwest::cookie::Jar::default());
    let client = reqwest::Client::builder()
        .cookie_provider(jar)
        .user_agent(DEFAULT_USER_AGENT)
        .build()
        .unwrap();

    let proxy_port = Arc::new(Mutex::new(0u16));
    let proxy_port_clone = proxy_port.clone();

    // 1. Initialize Task Store
    let task_store = TaskStore::new();

    // Start Proxy Server
    tauri::async_runtime::spawn(async move {
        run_proxy_server(proxy_port_clone).await;
    });

    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .manage(AppHttpClient(client))
        .manage(ProxyPort(proxy_port))
        .manage(task_store) // 2. IMPORTANT: Register the store here
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            clear_settings,
            get_store,
            set_store,
            clear_store,
            select_directory,
            open_directory,
            get_fonts,
            check_file_exists,
            start_download,
            add_media_download_task,
            get_media_download_task_list,
            clear_media_download_task_list,
            get_cookie,
            http_request,
            http_get,
            http_post,
            update_playback_state,
            switch_to_mini,
            switch_to_main,
            minimize_window,
            toggle_maximize_window,
            close_window,
            is_maximized,
            is_full_screen,
            get_app_version,
            check_app_update,
            download_app_update,
            quit_and_install,
            open_installer_directory,
            get_proxy_port
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}