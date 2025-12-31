import { contextBridge, ipcRenderer } from "electron";

import { channel } from "./ipc/channel";

let playerPrevHandler: ((_: Electron.IpcRendererEvent) => void) | null = null;
let playerNextHandler: ((_: Electron.IpcRendererEvent) => void) | null = null;
let playerToggleHandler: ((_: Electron.IpcRendererEvent) => void) | null = null;

const api: ElectronAPI = {
  getStore: name => ipcRenderer.invoke(channel.store.get, name),
  setStore: (name, value: any) => ipcRenderer.invoke(channel.store.set, name, value),
  clearStore: name => ipcRenderer.invoke(channel.store.clear, name),
  selectDirectory: () => ipcRenderer.invoke(channel.dialog.selectDirectory),
  selectFile: () => ipcRenderer.invoke(channel.dialog.selectFile),
  openDirectory: path => ipcRenderer.invoke(channel.dialog.openDirectory, path),
  showFileInFolder: filePath => ipcRenderer.invoke(channel.dialog.showFileInFolder, filePath),
  openExternal: url => ipcRenderer.invoke(channel.dialog.openExternal, url),
  getFonts: () => ipcRenderer.invoke(channel.font.getFonts),
  getCookie: key => ipcRenderer.invoke(channel.cookie.get, key),
  setCookie: (name, value, expirationDate) => ipcRenderer.invoke(channel.cookie.set, { name, value, expirationDate }),
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
  // 订阅主进程下发的快捷键命令
  onShortcutCommand: cb => {
    const handler = (_: Electron.IpcRendererEvent, cmd: ShortcutCommand) => {
      try {
        cb(cmd);
      } catch (error) {
        console.error("[preload] shortcut command callback failed:", error);
      }
    };

    ipcRenderer.on(channel.shortcut.triggered, handler);

    return () => ipcRenderer.removeListener(channel.shortcut.triggered, handler);
  },
  // 注册快捷键，返回是否注册成功
  registerShortcut: ({ id, accelerator }) => ipcRenderer.invoke(channel.shortcut.register, { id, accelerator }),
  // 注销指定快捷键
  unregisterShortcut: id => ipcRenderer.invoke(channel.shortcut.unregister, id),
  // 注册所有快捷键
  registerAllShortcuts: () => ipcRenderer.invoke(channel.shortcut.registerAll),
  // 注销所有快捷键
  unregisterAllShortcuts: () => ipcRenderer.invoke(channel.shortcut.unregisterAll),
  // 订阅主进程下发的播放器命令（上一首、下一首、播放/暂停）
  onPlayerCommand: cb => {
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

    return () => {
      if (playerPrevHandler) {
        ipcRenderer.removeListener(channel.player.prev, playerPrevHandler);
        playerPrevHandler = null;
      }
      if (playerNextHandler) {
        ipcRenderer.removeListener(channel.player.next, playerNextHandler);
        playerNextHandler = null;
      }
      if (playerToggleHandler) {
        ipcRenderer.removeListener(channel.player.toggle, playerToggleHandler);
        playerToggleHandler = null;
      }
    };
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
  // 打开桌面歌词窗口
  openLyricsOverlay: () => ipcRenderer.invoke(channel.window.openLyricsOverlay),
  // 关闭桌面歌词窗口
  closeLyricsOverlay: () => ipcRenderer.invoke(channel.window.closeLyricsOverlay),
  // 桌面歌词窗口是否已打开
  isLyricsOverlayOpen: () => ipcRenderer.invoke(channel.window.isLyricsOverlayOpen),
  // 打开桌面歌词设置窗口
  openLyricsOverlaySettings: () => ipcRenderer.invoke(channel.window.openLyricsOverlaySettings),
  // 关闭桌面歌词设置窗口
  closeLyricsOverlaySettings: () => ipcRenderer.invoke(channel.window.closeLyricsOverlaySettings),
  // 桌面歌词设置窗口是否已打开
  isLyricsOverlaySettingsOpen: () => ipcRenderer.invoke(channel.window.isLyricsOverlaySettingsOpen),
  // 监听桌面歌词设置窗口每次显示
  onLyricsOverlaySettingsShow: cb => {
    const handler = () => cb();
    ipcRenderer.on(channel.window.lyricsOverlaySettingsShow, handler);
    return () => ipcRenderer.removeListener(channel.window.lyricsOverlaySettingsShow, handler);
  },
  // 获取桌面歌词窗口 bounds（x/y/width/height）
  getLyricsOverlayBounds: () => ipcRenderer.invoke(channel.window.getLyricsOverlayBounds),
  // 设置桌面歌词窗口 bounds（可只传 width/height）
  setLyricsOverlayBounds: (bounds: { width?: number; height?: number; x?: number; y?: number }) =>
    ipcRenderer.invoke(channel.window.setLyricsOverlayBounds, bounds),
  // 切换 mini/主窗口
  toggleMiniPlayer: () => ipcRenderer.invoke(channel.window.toggleMini),
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
  addMediaDownloadTask: media => ipcRenderer.invoke(channel.download.add, media),
  /** 添加下载任务列表 */
  addMediaDownloadTaskList: mediaList => ipcRenderer.invoke(channel.download.addList, mediaList),
  // 暂停文件下载任务
  pauseMediaDownloadTask: id => ipcRenderer.invoke(channel.download.pause, id),
  // 恢复文件下载任务
  resumeMediaDownloadTask: id => ipcRenderer.invoke(channel.download.resume, id),
  // 重试文件下载任务
  retryMediaDownloadTask: id => ipcRenderer.invoke(channel.download.retry, id),
  // 取消文件下载任务
  cancelMediaDownloadTask: id => ipcRenderer.invoke(channel.download.cancel, id),
  // 监听文件下载任务状态变化
  syncMediaDownloadTaskList: cb => {
    const handler = (_, payload: MediaDownloadBroadcastPayload) => cb(payload);
    ipcRenderer.on(channel.download.sync, handler);
    return () => ipcRenderer.removeListener(channel.download.sync, handler);
  },
  // 清除文件下载任务列表
  clearMediaDownloadTaskList: () => ipcRenderer.invoke(channel.download.clear),
  // 从外部歌词服务查询歌词（返回原始响应文本）
  searchLyrics: (params: { urlTemplate: string; title?: string; artist?: string }) =>
    ipcRenderer.invoke(channel.lyrics.search, params),
  // 从网易云音乐查询歌词（返回 LRC 文本）
  searchLyricsNetease: (params: {
    title?: string;
    artist?: string;
    searchUrlTemplate?: string;
    lyricUrlTemplate?: string;
  }) => ipcRenderer.invoke(channel.lyrics.searchNetease, params),
  // 通过外部服务解析“真实歌名”（返回文本），并按 cacheKey 做本地缓存
  resolveSongTitle: (params: { cacheKey: string; urlTemplate: string; title?: string; artist?: string }) =>
    ipcRenderer.invoke(channel.lyrics.resolveTitle, params),
  // 通过火山 Ark(Doubao) 解析“真实歌名”（返回文本），并按 cacheKey 做本地缓存
  resolveSongTitleArk: (params: { cacheKey: string; title?: string; artist?: string }) =>
    ipcRenderer.invoke(channel.lyrics.resolveTitleArk, params),
};

contextBridge.exposeInMainWorld("electron", api);
