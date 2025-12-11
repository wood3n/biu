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
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke(channel.app.getVersion),
  // 检查应用更新
  checkAppUpdate: () => ipcRenderer.invoke(channel.app.checkUpdate),
  // 监听应用更新事件
  onUpdateAvailable: cb => {
    const handler = (_, payload: AppUpdateReleaseInfo) => cb(payload);
    ipcRenderer.on(channel.app.onUpdateAvailable, handler);
    return () => ipcRenderer.removeListener(channel.app.onUpdateAvailable, handler);
  },
  // 检查是否支持自动更新
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
  // 下载应用更新
  downloadAppUpdate: () => ipcRenderer.invoke(channel.app.downloadUpdate),
  // 监听应用更新进度事件
  onDownloadAppProgress: cb => {
    const handler = (_, payload: DownloadAppMessage) => cb(payload);
    ipcRenderer.on(channel.app.updateMessage, handler);
    return () => ipcRenderer.removeListener(channel.app.updateMessage, handler);
  },
  // 退出并安装更新
  quitAndInstall: () => ipcRenderer.invoke(channel.app.quitAndInstall),
  // 打开安装包下载目录
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
  // 获取下载任务列表
  getMediaDownloadTaskList: () => ipcRenderer.invoke(channel.download.getList),
  // 添加文件下载任务
  addMediaDownloadTask: (media: MediaDownloadInfo) => ipcRenderer.invoke(channel.download.add, media),
  // 暂停文件下载任务
  pauseMediaDownloadTask: (id: string) => ipcRenderer.invoke(channel.download.pause, id),
  // 恢复文件下载任务
  resumeMediaDownloadTask: (id: string) => ipcRenderer.invoke(channel.download.resume, id),
  // 重试文件下载任务
  retryMediaDownloadTask: (id: string) => ipcRenderer.invoke(channel.download.retry, id),
  // 取消文件下载任务
  cancelMediaDownloadTask: (id: string) => ipcRenderer.invoke(channel.download.cancel, id),
  // 监听文件下载任务状态变化
  syncMediaDownloadTaskList: cb => {
    const handler = (_, payload: MediaDownloadTask[]) => cb(payload);
    ipcRenderer.on(channel.download.sync, handler);
    return () => ipcRenderer.removeListener(channel.download.sync, handler);
  },
};

contextBridge.exposeInMainWorld("electron", api);
