import { BrowserWindow, ipcMain } from "electron";

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
}
