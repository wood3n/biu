import { contextBridge, ipcRenderer } from "electron";

import { channel } from "./ipc/channel";

// 防止重复注册 router:navigate 监听造成 MaxListenersExceededWarning
let navigateHandler: ((_: Electron.IpcRendererEvent, path: string) => void) | null = null;
let downloadProgressHandler: ((_: Electron.IpcRendererEvent, params: DownloadCallbackParams) => void) | null = null;

// 统一平台字符串：macos | windows | linux
const platform: "macos" | "windows" | "linux" =
  process.platform === "darwin" ? "macos" : process.platform === "win32" ? "windows" : "linux";

const api: ElectronAPI = {
  getSettings: () => ipcRenderer.invoke(channel.store.getSettings),
  setSettings: (value: Partial<AppSettings>) => ipcRenderer.invoke(channel.store.setSettings, value),
  clearSettings: () => ipcRenderer.invoke(channel.store.clearSettings),
  selectDirectory: () => ipcRenderer.invoke(channel.dialog.selectDirectory),
  openDirectory: (path?: string) => ipcRenderer.invoke(channel.dialog.openDirectory, path),
  openExternal: (url: string) => ipcRenderer.invoke(channel.dialog.openExternal, url),
  getFonts: () => ipcRenderer.invoke(channel.font.getFonts),
  checkFileExists: (filename: string) => ipcRenderer.invoke(channel.download.checkExists, filename),
  startDownload: (params: DownloadOptions) => ipcRenderer.invoke(channel.download.start, params),
  onDownloadProgress: async (cb: (params: DownloadCallbackParams) => void) => {
    if (downloadProgressHandler) {
      try {
        ipcRenderer.removeListener(channel.download.progress, downloadProgressHandler);
      } catch (error) {
        console.error("[preload] 移除下载进度监听器失败:", error);
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
      } catch (error) {
        console.error("[preload] 移除导航监听器失败:", error);
      }
      navigateHandler = null;
    }

    navigateHandler = (_: Electron.IpcRendererEvent, path: string) => {
      try {
        cb(path);
      } catch (error) {
        console.error("[preload] 导航回调失败:", error);
      }
    };

    ipcRenderer.on(channel.router.navigate, navigateHandler);
  },
  // 通过主进程 http 封装发起请求（只返回 data，风格与 axios 保持一致）
  httpGet: <T = any>(
    url: string,
    options?: { params?: Record<string, any>; headers?: Record<string, string>; timeout?: number },
  ) => ipcRenderer.invoke(channel.http.get, { url, ...options }) as Promise<T>,
  httpPost: <T = any>(
    url: string,
    body?: unknown,
    options?: { params?: Record<string, any>; headers?: Record<string, string>; timeout?: number },
  ) => ipcRenderer.invoke(channel.http.post, { url, body, ...options }) as Promise<T>,
  // 返回当前应用运行的平台（macos/windows/linux）
  getPlatform: () => platform,
  // 设置登录 Cookie
  setLoginCookies: (cookies: Array<{ name: string; value: string; expirationDate?: number }>) =>
    ipcRenderer.invoke(channel.cookie.setLoginCookies, cookies) as Promise<boolean>,
};

contextBridge.exposeInMainWorld("electron", api);
