import { contextBridge, ipcRenderer } from "electron";

import { channel } from "./ipc/channel";

// 防止重复注册 router:navigate 监听造成 MaxListenersExceededWarning
let navigateHandler: ((_: Electron.IpcRendererEvent, path: string) => void) | null = null;
let downloadProgressHandler: ((_: Electron.IpcRendererEvent, params: DownloadCallbackParams) => void) | null = null;

const api: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke(channel.store.getSettings),
  setSettings: (value: Partial<AppSettings>) => ipcRenderer.invoke(channel.store.setSettings, value),
  clearSettings: () => ipcRenderer.invoke(channel.store.clearSettings),
  selectDirectory: () => ipcRenderer.invoke(channel.dialog.selectDirectory),
  openDirectory: (path?: string) => ipcRenderer.invoke(channel.dialog.openDirectory, path),
  openExternal: (url: string) => ipcRenderer.invoke(channel.dialog.openExternal, url),
  getFonts: () => ipcRenderer.invoke(channel.font.getFonts),
  startDownload: (params: DownloadOptions) => ipcRenderer.invoke(channel.download.start, params),
  onDownloadProgress: async (cb: (params: DownloadCallbackParams) => void) => {
    if (downloadProgressHandler) {
      try {
        ipcRenderer.removeListener(channel.download.progress, downloadProgressHandler);
      } catch {
        // ignore remove errors
      }
      downloadProgressHandler = null;
    }

    downloadProgressHandler = (_, params) => {
      cb(params);
    };

    ipcRenderer.on(channel.download.progress, downloadProgressHandler);
  },
  // 监听来自主进程的导航事件，并将路径回调给渲染端
  navigate: async (cb: (path: string) => void) => {
    // 如果已存在监听器，先移除之前的，避免重复累积监听
    if (navigateHandler) {
      try {
        ipcRenderer.removeListener(channel.router.navigate, navigateHandler);
      } catch {
        // ignore remove errors
      }
      navigateHandler = null;
    }

    navigateHandler = (_: Electron.IpcRendererEvent, path: string) => {
      try {
        cb(path);
      } catch {
        // 防御性处理：避免回调抛错影响主进程事件循环
      }
    };

    ipcRenderer.on(channel.router.navigate, navigateHandler);
  },
};

contextBridge.exposeInMainWorld("electron", api);
