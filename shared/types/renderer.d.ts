interface IFontInfo {
  name: string;
  familyName: string;
  postScriptName: string;
  weight: string;
  style: string;
  width: string;
  monospace: boolean;
}

type AppPlatForm = "macos" | "windows" | "linux";

interface ElectronAPI {
  getSettings: () => Promise<AppSettings>;
  setSettings: (patch: Partial<AppSettings>) => Promise<void>;
  clearSettings: () => Promise<void>;
  /** 打开系统目录选择对话框，返回选中的目录路径 */
  selectDirectory: () => Promise<string | null>;
  /** 打开本地目录（默认打开下载目录） */
  openDirectory: (path?: string) => Promise<boolean>;
  /** 在外部浏览器打开链接 */
  openExternal: (url: string) => Promise<boolean>;
  /** 获取本地安装的字体列表 */
  getFonts: () => Promise<IFontInfo[]>;
  /** 导航到指定路由 */
  navigate: (cb: (path: string) => void) => VoidFunction;
  /** 获取某个 cookie */
  getCookie: (key: string) => Promise<string | null>;
  /** 获取当前应用平台：macos | windows | linux */
  getPlatform: () => AppPlatForm;
  /** 上报当前播放状态到主进程（用于任务栏按钮切换） */
  updatePlaybackState: (isPlaying: boolean) => void;
  /** 订阅主进程下发的播放器命令（上一首、下一首、播放/暂停） */
  onPlayerCommand: (cb: (cmd: "prev" | "next" | "toggle") => void) => Promise<void>;
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
  /** 打开安装包所在目录 */
  openInstallerDirectory: () => Promise<boolean>;
  /** 切换到 mini 播放器窗口 */
  switchToMiniPlayer: () => Promise<void>;
  /** 切换到主窗口 */
  switchToMainWindow: () => Promise<void>;
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
  /** 添加下载任务 */
  addMediaDownloadTask: (media: MediaDownloadTask) => Promise<void>;
  /** 暂停下载任务 */
  pauseMediaDownloadTask: (id: string) => Promise<void>;
  /** 恢复下载任务 */
  resumeMediaDownloadTask: (id: string) => Promise<void>;
  /** 取消下载任务 */
  cancelMediaDownloadTask: (id: string) => Promise<void>;
  /** 重试下载任务 */
  retryMediaDownloadTask: (id: string) => Promise<void>;
  /** 监听下载任务状态变化 */
  onMediaDownloadTaskChange: (cb: (payload: MediaDownloadTaskChangeData) => void) => VoidFunction;
}

interface Window {
  electron: ElectronAPI;
}
