/**
 * 窗口事件,属性
 */
export const win = {
  isMaximized: () => window.electron.isMaximized(),
  close: () => window.electron.close(),
  max: () => window.electron.maxWin(),
  min: () => window.electron.minWin(),
  resize: () => window.electron.resize()
};