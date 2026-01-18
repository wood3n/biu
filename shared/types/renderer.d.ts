declare global {
  type AppPlatForm = "macos" | "windows" | "linux";

  type StoreName = keyof StoreDataMap;
  interface LocalMusicItem {
    id: string;
    path: string;
    dir: string;
    title: string;
    size: number;
    format: string;
    duration?: number;
    createdTime?: number;
  }

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
    /** 搜索网易云歌曲 */
    searchNeteaseSongs: (params: SearchSongByNeteaseParams) => Promise<SearchSongByNeteaseResponse>;
    /** 获取网易云歌词 */
    getNeteaseLyrics: (params: GetLyricsByNeteaseParams) => Promise<GetLyricsByNeteaseResponse>;
    /** 在 LrcLib 搜索歌曲/歌词 */
    searchLrclibLyrics: (params: SearchSongByLrclibParams) => Promise<SearchSongByLrclibResponse[]>;
    /** 获取当前应用平台：macos | windows | linux */
    getPlatform: () => AppPlatForm;
    /** 更新网络代理设置 */
    setProxySettings: (proxySettings: ProxySettings) => Promise<void>;
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
    /** 判断是否为开发模式 */
    isDev: () => Promise<boolean>;
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
    /** 切换开发者工具 */
    toggleDevTools: () => void;
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
    /** 扫描本地音乐文件 */
    scanLocalMusic: (dirs: string[]) => Promise<LocalMusicItem[]>;
    /** 删除本地音乐文件 */
    deleteLocalMusicFile: (filePath: string) => Promise<boolean>;
  }

  interface Window {
    electron: ElectronAPI;
  }
}

export {};
