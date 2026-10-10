import { BrowserWindow, ipcMain } from "electron";

import {
  destroyDesktopLyrics,
  getDesktopLyricsBounds,
  isDesktopLyricsOpen,
  setDesktopLyricsBounds,
  setDesktopLyricsLocked,
  toggleDesktopLyrics,
  updateDesktopLyricsStyle,
} from "../lyrics-window";
import { createMiniPlayer, destroyMiniPlayer, miniPlayer } from "../mini-player";
import { channel } from "./channel";

export function registerWindowHandlers({ getMainWindow }) {
  ipcMain.on(channel.window.minimize, event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
  });

  ipcMain.on(channel.window.toggleMaximize, event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on(channel.window.close, event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
  });

  ipcMain.handle(channel.window.isMaximized, event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win?.isMaximized() ?? false;
  });

  ipcMain.handle(channel.window.isFullScreen, event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win?.isFullScreen() ?? false;
  });

  ipcMain.handle(channel.window.toggleMini, () => {
    const mainWindow = getMainWindow?.();
    if (miniPlayer && !miniPlayer.isDestroyed()) {
      destroyMiniPlayer();
      mainWindow?.show();
    } else {
      mainWindow?.hide();
      createMiniPlayer();
    }
  });

  ipcMain.on(channel.window.toggleDevTools, event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.webContents.toggleDevTools();
  });

  // 桌面歌词窗口
  ipcMain.handle(channel.window.toggleLyrics, () => {
    return toggleDesktopLyrics();
  });

  ipcMain.handle(channel.window.isLyricsOpen, () => {
    return isDesktopLyricsOpen();
  });

  // 从桌面歌词窗口唤起主窗口（用于"选歌词"），保证弹窗能被看到
  ipcMain.on(channel.window.focusMain, () => {
    const mainWindow = getMainWindow?.();

    if (!mainWindow || mainWindow.isDestroyed()) return;

    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  });

  // 桌面歌词：读取 / 设置窗口位置与大小（渲染层的拖拽手柄驱动）
  ipcMain.handle(channel.window.getLyricsBounds, () => {
    return getDesktopLyricsBounds();
  });

  ipcMain.on(channel.window.setLyricsBounds, (_, bounds: Partial<Electron.Rectangle>) => {
    setDesktopLyricsBounds(bounds ?? {});
  });

  ipcMain.on(channel.window.closeLyrics, () => {
    destroyDesktopLyrics();
  });

  ipcMain.on(channel.window.setLyricsLocked, (_, locked: boolean) => {
    setDesktopLyricsLocked(Boolean(locked));
  });

  ipcMain.handle(channel.window.updateLyricsStyle, (_, style: Partial<DesktopLyricsStyle>) => {
    return updateDesktopLyricsStyle(style);
  });
}
