import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("electron", {});

/**
 * 系统版本信息
 */
contextBridge.exposeInMainWorld("versions", {
  platform: () => process.platform,
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});
