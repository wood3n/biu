import { contextBridge, ipcRenderer } from "electron";

import { channel } from "./ipc/channel";

const api: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke(channel.store.getSettings),
  setSettings: (value: Partial<AppSettings>) => ipcRenderer.invoke(channel.store.setSettings, value),
  clearSettings: () => ipcRenderer.invoke(channel.store.clearSettings),
  selectDirectory: () => ipcRenderer.invoke(channel.dialog.selectDirectory),
  openDirectory: (path?: string) => ipcRenderer.invoke(channel.dialog.openDirectory, path),
  getFonts: () => ipcRenderer.invoke(channel.font.getFonts),
  startDownload: (params: DownloadOptions) => ipcRenderer.invoke(channel.download.start, params),
  listDownloads: () => ipcRenderer.invoke(channel.download.list),
  // 监听来自主进程的导航事件，并将路径回调给渲染端
  navigate: async (cb: (path: string) => void) => {
    try {
      // 避免重复绑定导致多次触发
      ipcRenderer.removeAllListeners(channel.router.navigate);
    } catch {}
    ipcRenderer.on(channel.router.navigate, (_event, path: string) => {
      try {
        cb(path);
      } catch {}
    });
  },
};

contextBridge.exposeInMainWorld("electron", api);
