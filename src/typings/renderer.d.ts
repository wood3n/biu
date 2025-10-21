/*
 * electron 暴露给 web 的 ipc 方法
 * http://www.electronjs.org/docs/latest/tutorial/context-isolation#usage-with-typescript
 */

interface AppSettings {
  fontFamily: string;
  color: string;
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

interface DownloadOptions {
  /** 下载文件的标题 */
  title: string;
  /** 下载文件的视频 url */
  videoUrl: string;
  /** 下载文件的音频 url */
  audioUrl: string;
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
  startDownload: (options: DownloadOptions) => Promise<void>;
  /** 列出下载目录文件 */
  listDownloads: () => Promise<
    {
      name: string;
      format: string;
      size: number;
      time: number; // mtimeMs
    }[]
  >;
  /** 导航到指定路由 */
  navigate: (cb: (path: string) => void) => Promise<void>;
}

interface Window {
  electron: ElectronAPI;
}
