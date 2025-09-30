/*
 * electron 暴露给 web 的 ipc 方法
 * http://www.electronjs.org/docs/latest/tutorial/context-isolation#usage-with-typescript
 */

interface SettingsState {
  fontFamily: string;
  color: string;
  borderRadius: number;
  downloadPath: string;
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

interface ElectronAPI {
  getSettings: () => Promise<SettingsState>;
  setSettings: (patch: Partial<SettingsState>) => Promise<void>;
  clearSettings: () => Promise<void>;
  /** 打开系统目录选择对话框，返回选中的目录路径 */
  selectDirectory: () => Promise<string | null>;
  /** 获取本地安装的字体列表 */
  getFonts: () => Promise<IFontInfo[]>;
}

type Platform =
  | "aix"
  | "android"
  | "darwin"
  | "freebsd"
  | "haiku"
  | "linux"
  | "openbsd"
  | "sunos"
  | "win32"
  | "cygwin"
  | "netbsd";

interface Version {
  platform: () => Platform;
  node: () => string;
  chrome: () => string;
  electron: () => string;
}

interface Window {
  electron: ElectronAPI;
  versions: Version;
}
