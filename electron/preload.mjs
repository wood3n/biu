import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  isMaximized: () => ipcRenderer.invoke("isMaximized"),
  close: () => ipcRenderer.invoke("close-window"),
  maxWin: () => ipcRenderer.invoke("max-win"),
  minWin: () => ipcRenderer.invoke("min-win"),
  resize: () => ipcRenderer.invoke("resize"),
});

/**
 * 系统版本信息
 */
contextBridge.exposeInMainWorld("versions", {
  platform: () => process.platform,
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});
