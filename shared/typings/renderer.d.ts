/*
 * electron 暴露给 web 的 ipc 方法
 * http://www.electronjs.org/docs/latest/tutorial/context-isolation#usage-with-typescript
 */

interface AppSettings {
  fontFamily: string;
  backgroundColor: string;
  contentBackgroundColor: string;
  primaryColor: string;
  borderRadius: number;
  downloadPath?: string;
  closeWindowOption: "hide" | "exit";
  autoStart: boolean;
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
  /** 开始下载文件 */
  startDownload: (options: DownloadOptions) => Promise<StartDownloadResponse>;
  /** 监听下载进度（包含 video/audio/merge 阶段），重复调用会替换旧监听 */
  onDownloadProgress: (cb: (payload: DownloadCallbackParams) => void) => Promise<void>;
  /** 导航到指定路由 */
  navigate: (cb: (path: string) => void) => Promise<void>;
}

interface Window {
  electron: ElectronAPI;
}
