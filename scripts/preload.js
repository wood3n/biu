/*
 * preloadjs模块用于在渲染 web 页面前加载执行，其内部可以部分访问 nodejs api 和 dom api；
 * 更常用的，preloadjs 起到 web 渲染进程 和 electron 主进程之间桥梁的作用，也就是通过 ipcRenderer 暴露 electron 内部的一些方法，
 * 从而在 web 页面中方法
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
});
