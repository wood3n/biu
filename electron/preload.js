/*
 * preloadjs模块用于在渲染 web 页面前加载执行，其内部可以部分访问 nodejs api 和 dom api；
 * 更常用的，preloadjs 起到 web 渲染进程 和 electron 主进程之间桥梁的作用，也就是通过 ipcRenderer 暴露 electron 内部的一些方法，
 * 然后通过 ipcMain 在 main.js 主线程内部注册事件方法，这样就可以在 web 页面中使用这些方法
 */
const { contextBridge, ipcRenderer } = require("electron");

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
