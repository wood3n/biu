/*
 * electron 暴露给 web 的 ipc 方法
 * http://www.electronjs.org/docs/latest/tutorial/context-isolation#usage-with-typescript
 */

type AudioQuality = "auto" | "lossless" | "high" | "medium" | "low";

interface AppSettings {
  fontFamily: string;
  backgroundColor: string;
  contentBackgroundColor: string;
  primaryColor: string;
  borderRadius: number;
  downloadPath?: string;
  closeWindowOption: "hide" | "exit";
  autoStart: boolean;
  audioQuality: AudioQuality;
  hiddenMenuKeys: string[];
}

interface IFontInfo {
  name: string;
  familyName: string;
  postScriptName: string;
  weight: string;
  style: string;
  width: string;
  monospace: boolean;
}

type DownloadStatus = "waiting" | "downloading" | "merging" | "completed" | "failed";

interface DownloadOptions {
  /** 唯一标识（推荐传入 bvid），用于进度回调匹配 */
  id: string;
  /** 下载文件的标题 */
  filename: string;
  /** 下载文件的音频 url */
  audioUrl: string;
  /** 是否为无损音频 */
  isLossless: boolean;
  /** 下载文件的视频 url */
  videoUrl?: string;
}

interface DownloadCallbackParams {
  id: string;
  totalBytes?: number;
  downloadedBytes?: number;
  progress?: number;
  status: DownloadStatus;
  error?: string;
}

interface StartDownloadResponse {
  success: boolean;
  error?: string;
}

type AppPlatForm = "macos" | "windows" | "linux";

interface AppUpdateReleaseInfo {
  /** 最新版本 */
  latestVersion?: string;
  /** html 字符串 */
  releaseNotes?: string;
}

interface CheckAppUpdateResult extends AppUpdateReleaseInfo {
  isUpdateAvailable?: boolean;
  error?: string;
}

interface DownloadAppProgressInfo {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}

type DownloadAppUpdateStatus = "downloading" | "downloaded" | "error";

interface DownloadAppMessage {
  status: DownloadAppUpdateStatus;
  processInfo?: DownloadAppProgressInfo;
  error?: string;
}

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
  /** 检查目标下载文件是否已存在（在下载目录中） */
  checkFileExists: (filename: string) => Promise<boolean>;
  /** 开始下载文件 */
  startDownload: (options: DownloadOptions) => Promise<StartDownloadResponse>;
  /** 监听下载进度（包含 video/audio/merge 阶段），重复调用会替换旧监听 */
  onDownloadProgress: (cb: (payload: DownloadCallbackParams) => void) => VoidFunction;
  /** 导航到指定路由 */
  navigate: (cb: (path: string) => void) => VoidFunction;
  /** 获取某个 cookie */
  getCookie: (key: string) => Promise<string | null>;
  /** 使用主进程的 net.request 发起 GET 请求（只返回 data） */
  httpGet: <T = any>(
    url: string,
    options?: { params?: Record<string, any>; headers?: Record<string, string>; timeout?: number },
  ) => Promise<T>;
  /** 使用主进程的 net.request 发起 POST 请求（只返回 data） */
  httpPost: <T = any>(
    url: string,
    body?: unknown,
    options?: { params?: Record<string, any>; headers?: Record<string, string>; timeout?: number },
  ) => Promise<T>;
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
  /** 监听账号切换命令 */
  onSwitchAccount: (cb: () => void) => VoidFunction;
}

interface Window {
  electron: ElectronAPI;
}
