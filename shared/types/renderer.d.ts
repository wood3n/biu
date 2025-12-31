declare global {
  type AppPlatForm = "macos" | "windows" | "linux";

  type StoreName = keyof StoreDataMap;
  interface ElectronAPI {
    /** 获取指定name的存储值 */
    getStore: <N extends StoreName>(name: N) => Promise<StoreDataMap[N] | undefined>;
    /** 设置指定name的存储值 */
    setStore: <N extends StoreName>(name: N, value: StoreDataMap[N]) => Promise<void>;
    /** 清除指定name的存储值 */
    clearStore: (name: StoreName) => Promise<void>;
    /** 打开系统目录选择对话框，返回选中的目录路径 */
    selectDirectory: () => Promise<string | null>;
    /** 显示指定路径的文件 */
    showFileInFolder: (filePath: string) => Promise<boolean>;
    /** 打开系统文件选择对话框，返回选中的文件路径 */
    selectFile: () => Promise<string | null>;
    /** 打开本地目录（默认打开下载目录） */
    openDirectory: (path?: string) => Promise<boolean>;
    /** 在外部浏览器打开链接 */
    openExternal: (url: string) => Promise<boolean>;
    /** 获取本地安装的字体列表 */
    getFonts: () => Promise<IFontInfo[]>;
    /** 导航到指定路由 */
    navigate: (cb: (path: string) => void) => VoidFunction;
    /** 获取某个 cookie */
    getCookie: (key: string) => Promise<string | undefined>;
    /** 设置 cookie */
    setCookie: (name: string, value: string, expirationDate?: number) => Promise<void>;
    /** 获取当前应用平台：macos | windows | linux */
    getPlatform: () => AppPlatForm;
    /** 上报当前播放状态到主进程（用于任务栏按钮切换） */
    updatePlaybackState: (isPlaying: boolean) => void;
    /** 订阅主进程下发的快捷键命令 */
    onShortcutCommand: (cb: (cmd: ShortcutCommand) => void) => VoidFunction;
    /** 注册快捷键，返回是否注册成功 */
    registerShortcut: ({ id, accelerator }: { id: ShortcutCommand; accelerator: string }) => Promise<boolean>;
    /** 注销指定快捷键 */
    unregisterShortcut: (id: ShortcutCommand) => Promise<void>;
    /** 注册所有快捷键 */
    registerAllShortcuts: () => Promise<void>;
    /** 注销所有快捷键 */
    unregisterAllShortcuts: () => Promise<void>;
    /** 订阅主进程下发的播放器命令（上一首、下一首、播放/暂停） */
    onPlayerCommand: (cb: (cmd: "prev" | "next" | "toggle") => void) => VoidFunction;
    /** 获取当前应用版本 */
    getAppVersion: () => Promise<string>;
    /** 是否支持自动更新 */
    isSupportAutoUpdate: () => boolean;
    /** 检查更新 */
    checkAppUpdate: () => Promise<CheckAppUpdateResult>;
    /** 监听应用更新下载进度 */
    onUpdateAvailable: (cb: (updateInfo: AppUpdateReleaseInfo) => void) => VoidFunction;
    /** 下载更新 */
    downloadAppUpdate: () => Promise<void>;
    /** 监听应用更新下载进度 */
    onDownloadAppProgress: (cb: (payload: DownloadAppMessage) => void) => VoidFunction;
    /** 安装更新 */
    quitAndInstall: () => Promise<void>;
    /** 切换 mini/主窗口 */
    toggleMiniPlayer: () => Promise<void>;
    /** 打开桌面歌词窗口 */
    openLyricsOverlay: () => Promise<void>;
    /** 关闭桌面歌词窗口 */
    closeLyricsOverlay: () => Promise<void>;
    /** 桌面歌词窗口是否已打开 */
    isLyricsOverlayOpen: () => Promise<boolean>;
    /** 打开桌面歌词设置窗口 */
    openLyricsOverlaySettings: () => Promise<void>;
    /** 关闭桌面歌词设置窗口 */
    closeLyricsOverlaySettings: () => Promise<void>;
    /** 桌面歌词设置窗口是否已打开 */
    isLyricsOverlaySettingsOpen: () => Promise<boolean>;
    /** 监听桌面歌词设置窗口每次显示 */
    onLyricsOverlaySettingsShow: (cb: () => void) => VoidFunction;
    /** 获取桌面歌词窗口 bounds（x/y/width/height） */
    getLyricsOverlayBounds: () => Promise<{ x: number; y: number; width: number; height: number } | null>;
    /** 设置桌面歌词窗口 bounds（可只传 width/height） */
    setLyricsOverlayBounds: (bounds: {
      width?: number;
      height?: number;
      x?: number;
      y?: number;
    }) => Promise<{ x: number; y: number; width: number; height: number } | null>;
    /** 最小化窗口 */
    minimizeWindow: () => void;
    /** 最大化/还原窗口 */
    toggleMaximizeWindow: () => void;
    /** 关闭窗口 */
    closeWindow: () => void;
    /** 判断窗口是否最大化 */
    isMaximized: () => Promise<boolean>;
    /** 监听窗口最大化状态变化 */
    onWindowMaximizeChange: (cb: (isMaximized: boolean) => void) => VoidFunction;
    /** 判断窗口是否全屏 */
    isFullScreen: () => Promise<boolean>;
    /** 监听窗口全屏状态变化 */
    onWindowFullScreenChange: (cb: (isFullScreen: boolean) => void) => VoidFunction;
    /** 获取下载任务列表 */
    getMediaDownloadTaskList: () => Promise<MediaDownloadTask[]>;
    /** 同步下载任务列表 */
    syncMediaDownloadTaskList: (cb: (payload: MediaDownloadBroadcastPayload) => void) => VoidFunction;
    /** 添加下载任务 */
    addMediaDownloadTask: (media: MediaDownloadInfo) => Promise<void>;
    /** 添加下载任务列表 */
    addMediaDownloadTaskList: (mediaList: MediaDownloadInfo[]) => Promise<void>;
    /** 暂停下载任务 */
    pauseMediaDownloadTask: (id: string) => Promise<void>;
    /** 恢复下载任务 */
    resumeMediaDownloadTask: (id: string) => Promise<void>;
    /** 取消下载任务 */
    cancelMediaDownloadTask: (id: string) => Promise<void>;
    /** 重试下载任务 */
    retryMediaDownloadTask: (id: string) => Promise<void>;
    /** 清除下载任务列表 */
    clearMediaDownloadTaskList: () => Promise<void>;
    /** 从外部歌词服务查询歌词（返回原始响应文本） */
    searchLyrics: (params: { urlTemplate: string; title?: string; artist?: string }) => Promise<string | null>;
    /** 从网易云音乐查询歌词（返回 LRC 文本） */
    searchLyricsNetease: (params: {
      title?: string;
      artist?: string;
      searchUrlTemplate?: string;
      lyricUrlTemplate?: string;
    }) => Promise<string | null>;
    /**
     * 通过外部服务解析“真实歌名”（返回文本），并按 cacheKey 做本地缓存
     * - urlTemplate 支持 {title}/{artist}/{query}
     */
    resolveSongTitle: (params: {
      cacheKey: string;
      urlTemplate: string;
      title?: string;
      artist?: string;
    }) => Promise<string | null>;
    /**
     * 通过火山 Ark(Doubao) 解析“真实歌名”（返回文本），并按 cacheKey 做本地缓存
     */
    resolveSongTitleArk: (params: {
      cacheKey: string;
      title?: string;
      artist?: string;
    }) => Promise<{ title: string; artist?: string } | null>;
  }

  interface Window {
    electron: ElectronAPI;
  }
}

export {};
