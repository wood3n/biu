import { contextBridge, ipcRenderer } from "electron";

import { channel } from "./ipc/channel.mjs";

contextBridge.exposeInMainWorld("electron", {
  getSettings: () => ipcRenderer.invoke(channel.store.getSettings),
  setSettings: value => ipcRenderer.invoke(channel.store.setSettings, value),
  clearSettings: () => ipcRenderer.invoke(channel.store.clearSettings),
  selectDirectory: () => ipcRenderer.invoke(channel.dialog.selectDirectory),
  openDirectory: path => ipcRenderer.invoke(channel.dialog.openDirectory, path),
  getFonts: () => ipcRenderer.invoke(channel.font.getFonts),
  startDownload: params => ipcRenderer.invoke(channel.download.start, params),
  listDownloads: () => ipcRenderer.invoke(channel.download.list),
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

ipcRenderer.on(channel.router.navigate, (_event, path) => {
  const hash = path.startsWith("/") ? `#${path}` : `#/${path}`;
  try {
    window.location.hash = hash;
  } catch {}
});
