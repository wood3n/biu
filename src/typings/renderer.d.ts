/*
 * electron 暴露给 web 的 ipc 方法
 * http://www.electronjs.org/docs/latest/tutorial/context-isolation#usage-with-typescript
 */
export interface IElectronAPI {
  isMaximized: () => boolean;
  close: () => void;
  maxWin: () => void;
  minWin: () => void;
  resize: () => void;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
