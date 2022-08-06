/*
 * electron 暴露给 web 的 ipc 方法
 * http://www.electronjs.org/docs/latest/tutorial/context-isolation#usage-with-typescript
 */

export interface IElectronAPI {
  // 在 preload.js 中注册 ipcRenderer 的一些事件爱你，然后在 react 中使用
  loadPreferences: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
