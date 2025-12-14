import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-shell";
// Helper to handle async listeners synchronously to match existing API signature
const syncListen = (event: string, callback: (payload: any) => void) => {
  let unlisten: (() => void) | undefined;
  let cancelled = false;

  listen(event, e => callback(e.payload)).then(u => {
    if (cancelled) {
      u();
    } else {
      unlisten = u;
    }
  });

  return () => {
    cancelled = true;
    if (unlisten) unlisten();
  };
};

export const tauriAdapter: any = {
  // Store / Settings
  getSettings: () => invoke("get_settings"),
  setSettings: (value: any) => invoke("set_settings", { payload: value }),
  clearSettings: () => invoke("clear_settings"),

  // Dialogs & Shell
  selectDirectory: () => invoke("select_directory"),
  openDirectory: (path?: string) => invoke("open_directory", { path }),
  openExternal: (url: string) => open(url),

  // Fonts
  getFonts: () => invoke("get_fonts"),

  // File / Download
  checkFileExists: (filename: string) => invoke("check_file_exists", { filename }),
  startDownload: (params: any) => invoke("start_download", { params }),
  onDownloadProgress: (cb: any) => {
    // Maps to channel.download.progress ("download:progress")
    return syncListen("download:progress", payload => cb(payload));
  },

  // Cookies
  getCookie: (key: string) => invoke("get_cookie", { key }),

  // Router / Navigation
  navigate: (cb: any) => {
    return syncListen("router:navigate", path => cb(path));
  },

  // HTTP (Relay requests through Rust to avoid CORS/Cookie issues)
  httpGet: (url: string, options?: any) => invoke("http_get", { url, options }),
  httpPost: (url: string, body?: any, options?: any) => invoke("http_post", { url, body, options }),

  // Platform
  getPlatform: () => {
    // Synchronous platform detection for frontend
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("mac")) return "macos";
    if (userAgent.includes("win")) return "windows";
    return "linux";
  },

  // Player
  updatePlaybackState: (isPlaying: boolean) => {
    invoke("update_playback_state", { isPlaying });
  },
  onPlayerCommand: (cb: (cmd: "prev" | "next" | "toggle") => void) => {
    // Listen to all three events and map them to the callback
    const unlistenPrev = syncListen("player:prev", () => cb("prev"));
    const unlistenNext = syncListen("player:next", () => cb("next"));
    const unlistenToggle = syncListen("player:toggle", () => cb("toggle"));

    // Return a composite cleanup function
    return () => {
      unlistenPrev();
      unlistenNext();
      unlistenToggle();
    };
  },

  // App / Updater
  getAppVersion: () => invoke("get_app_version"),
  checkAppUpdate: () => invoke("check_app_update"),
  onUpdateAvailable: (cb: any) => {
    return syncListen("app:on-update-available", cb);
  },
  isSupportAutoUpdate: () => {
    // Tauri auto-updater support logic (simplified)
    return true;
  },
  downloadAppUpdate: () => invoke("download_app_update"),
  onDownloadAppProgress: (cb: any) => {
    return syncListen("app:update-message", cb);
  },
  quitAndInstall: () => invoke("quit_and_install"),
  openInstallerDirectory: () => invoke("open_installer_directory"),

  // Window Management
  switchToMiniPlayer: () => invoke("switch_to_mini"),
  switchToMainWindow: () => invoke("switch_to_main"),
  minimizeWindow: () => invoke("minimize_window"),
  toggleMaximizeWindow: () => invoke("toggle_maximize_window"),
  closeWindow: () => invoke("close_window"),
  isMaximized: () => invoke("is_maximized"),
  onWindowMaximizeChange: (cb: any) => {
    const unlistenMax = syncListen("window:maximize", () => cb(true));
    const unlistenUnmax = syncListen("window:unmaximize", () => cb(false));
    return () => {
      unlistenMax();
      unlistenUnmax();
    };
  },
  isFullScreen: () => invoke("is_full_screen"),
  onWindowFullScreenChange: (cb: any) => {
    const unlistenEnter = syncListen("window:enter-full-screen", () => cb(true));
    const unlistenLeave = syncListen("window:leave-full-screen", () => cb(false));
    return () => {
      unlistenEnter();
      unlistenLeave();
    };
  },
};
