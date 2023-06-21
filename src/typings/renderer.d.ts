/*
 * electron 暴露给 web 的 ipc 方法
 * http://www.electronjs.org/docs/latest/tutorial/context-isolation#usage-with-typescript
 */
interface IElectronAPI {
  isMaximized: () => boolean;
  close: () => void;
  maxWin: () => void;
  minWin: () => void;
  resize: () => void;
}

type Platform = 'aix' | 'android' | 'darwin' | 'freebsd' | 'haiku' | 'linux' | 'openbsd' | 'sunos' | 'win32' | 'cygwin' | 'netbsd';

interface Version {
  platform: () => Platform;
  node: () => string;
  chrome: () => string;
  electron: () => string;
}

interface Window {
  electron: IElectronAPI;
  versions: Version;
}
