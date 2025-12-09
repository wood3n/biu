import { contextBridge, ipcRenderer } from "electron";

import { channel } from "./ipc/channel";

let playerPrevHandler: ((_: Electron.IpcRendererEvent) => void) | null = null;
let playerNextHandler: ((_: Electron.IpcRendererEvent) => void) | null = null;
let playerToggleHandler: ((_: Electron.IpcRendererEvent) => void) | null = null;

const api: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke(channel.store.getSettings),
  setSettings: (value: Partial<AppSettings>) => ipcRenderer.invoke(channel.store.setSettings, value),
  clearSettings: () => ipcRenderer.invoke(channel.store.clearSettings),
  selectDirectory: () => ipcRenderer.invoke(channel.dialog.selectDirectory),
  openDirectory: (path?: string) => ipcRenderer.invoke(channel.dialog.openDirectory, path),
  openExternal: (url: string) => ipcRenderer.invoke(channel.dialog.openExternal, url),
  getFonts: () => ipcRenderer.invoke(channel.font.getFonts),
  checkFileExists: (filename: string) => ipcRenderer.invoke(channel.download.checkExists, filename),
  startDownload: (params: DownloadOptions) => ipcRenderer.invoke(channel.download.start, params),
  onDownloadProgress: cb => {
    const downloadProgressHandler = (_, params: DownloadCallbackParams) => {
      cb(params);
    };

    ipcRenderer.on(channel.download.progress, downloadProgressHandler);

    return () => ipcRenderer.removeListener(channel.download.progress, downloadProgressHandler);
  },
  getCookie: (key: string) => ipcRenderer.invoke(channel.cookie.get, key),
  // 监听来自主进程的导航事件，并将路径回调给渲染端
  navigate: cb => {
    const navigateHandler = (_: Electron.IpcRendererEvent, path: string) => {
      try {
        cb(path);
      } catch (error) {
        console.error("[preload] 导航回调失败:", error);
      }
    };

    ipcRenderer.on(channel.router.navigate, navigateHandler);

    return () => ipcRenderer.removeListener(channel.router.navigate, navigateHandler);
  },
  // 通过主进程 http 封装发起请求（只返回 data，风格与 axios 保持一致）
  httpGet: <T = any>(
    url: string,
    options?: { params?: Record<string, any>; headers?: Record<string, string>; timeout?: number },
  ) => ipcRenderer.invoke(channel.http.get, { url, ...options }) as Promise<T>,
  httpPost: <T = any>(
    url: string,
    body?: unknown,
    options?: { params?: Record<string, any>; headers?: Record<string, string>; timeout?: number },
  ) => ipcRenderer.invoke(channel.http.post, { url, body, ...options }) as Promise<T>,
  // 返回当前应用运行的平台（macos/windows/linux）
  getPlatform: () => {
    const platform: AppPlatForm =
      process.platform === "darwin" ? "macos" : process.platform === "win32" ? "windows" : "linux";

    return platform;
  },
  // 上报当前播放状态（播放/暂停）给主进程，用于更新任务栏缩略按钮
  updatePlaybackState: isPlaying => {
    try {
      ipcRenderer.send(channel.player.state, isPlaying);
    } catch (error) {
      console.error("[preload] 上报播放状态失败:", error);
    }
  },
  // 订阅主进程下发的播放器命令（上一首、下一首、播放/暂停）
  onPlayerCommand: async (cb: (cmd: "prev" | "next" | "toggle") => void) => {
    // 先移除旧的监听，避免重复
    if (playerPrevHandler) {
      try {
        ipcRenderer.removeListener(channel.player.prev, playerPrevHandler);
      } catch (error) {
        console.error("[preload] 移除上一首监听器失败:", error);
      }
      playerPrevHandler = null;
    }
    if (playerNextHandler) {
      try {
        ipcRenderer.removeListener(channel.player.next, playerNextHandler);
      } catch (error) {
        console.error("[preload] 移除下一首监听器失败:", error);
      }
      playerNextHandler = null;
    }
    if (playerToggleHandler) {
      try {
        ipcRenderer.removeListener(channel.player.toggle, playerToggleHandler);
      } catch (error) {
        console.error("[preload] 移除播放/暂停监听器失败:", error);
      }
      playerToggleHandler = null;
    }
    playerPrevHandler = () => {
      try {
        cb("prev");
      } catch (error) {
        console.error("[preload] player prev 回调失败:", error);
      }
    };
    playerNextHandler = () => {
      try {
        cb("next");
      } catch (error) {
        console.error("[preload] player next 回调失败:", error);
      }
    };
    playerToggleHandler = () => {
      try {
        cb("toggle");
      } catch (error) {
        console.error("[preload] player toggle 回调失败:", error);
      }
    };

    ipcRenderer.on(channel.player.prev, playerPrevHandler);
    ipcRenderer.on(channel.player.next, playerNextHandler);
    ipcRenderer.on(channel.player.toggle, playerToggleHandler);
  },
  getAppVersion: () => ipcRenderer.invoke(channel.app.getVersion),
  checkAppUpdate: () => ipcRenderer.invoke(channel.app.checkUpdate),
  onUpdateAvailable: cb => {
    const handler = (_, payload: AppUpdateReleaseInfo) => cb(payload);
    ipcRenderer.on(channel.app.onUpdateAvailable, handler);
    return () => ipcRenderer.removeListener(channel.app.onUpdateAvailable, handler);
  },
  isSupportAutoUpdate: () => {
    const platform = process.platform;
    if (platform === "darwin") return false;
    if (platform === "win32") {
      const isPortable = Boolean(process.env.PORTABLE_EXECUTABLE_DIR || process.env.PORTABLE_EXECUTABLE_FILE);
      return !isPortable;
    }
    const isAppImage = Boolean(process.env.APPIMAGE);
    return isAppImage;
  },
  downloadAppUpdate: () => ipcRenderer.invoke(channel.app.downloadUpdate),
  onDownloadAppProgress: cb => {
    const handler = (_, payload: DownloadAppMessage) => cb(payload);
    ipcRenderer.on(channel.app.updateMessage, handler);
    return () => ipcRenderer.removeListener(channel.app.updateMessage, handler);
  },
  quitAndInstall: () => ipcRenderer.invoke(channel.app.quitAndInstall),
  openInstallerDirectory: () => ipcRenderer.invoke(channel.app.openInstallerDirectory),
  // 切换到 mini 播放器窗口
  switchToMiniPlayer: () => ipcRenderer.invoke(channel.window.switchToMini),
  // 切换到主窗口
  switchToMainWindow: () => ipcRenderer.invoke(channel.window.switchToMain),
  // 最小化窗口
  minimizeWindow: () => ipcRenderer.send(channel.window.minimize),
  // 最大化/还原窗口
  toggleMaximizeWindow: () => ipcRenderer.send(channel.window.toggleMaximize),
  // 关闭窗口
  closeWindow: () => ipcRenderer.send(channel.window.close),
  // 判断窗口是否最大化
  isMaximized: () => ipcRenderer.invoke(channel.window.isMaximized),
  // 监听窗口最大化状态变化
  onWindowMaximizeChange: cb => {
    const maximizeHandler = () => cb(true);
    const unmaximizeHandler = () => cb(false);

    ipcRenderer.on(channel.window.maximize, maximizeHandler);
    ipcRenderer.on(channel.window.unmaximize, unmaximizeHandler);

    return () => {
      ipcRenderer.removeListener(channel.window.maximize, maximizeHandler);
      ipcRenderer.removeListener(channel.window.unmaximize, unmaximizeHandler);
    };
  },
  // 判断窗口是否全屏
  isFullScreen: () => ipcRenderer.invoke(channel.window.isFullScreen),
  // 监听窗口全屏状态变化
  onWindowFullScreenChange: cb => {
    const enterFullScreenHandler = () => cb(true);
    const leaveFullScreenHandler = () => cb(false);

    ipcRenderer.on(channel.window.enterFullScreen, enterFullScreenHandler);
    ipcRenderer.on(channel.window.leaveFullScreen, leaveFullScreenHandler);

    return () => {
      ipcRenderer.removeListener(channel.window.enterFullScreen, enterFullScreenHandler);
      ipcRenderer.removeListener(channel.window.leaveFullScreen, leaveFullScreenHandler);
    };
  },
  // 监听账号切换命令
  onSwitchAccount: cb => {
    const handler = () => cb();
    ipcRenderer.on(channel.user.switchAccount, handler);
    return () => ipcRenderer.removeListener(channel.user.switchAccount, handler);
  },
};

contextBridge.exposeInMainWorld("electron", api);
