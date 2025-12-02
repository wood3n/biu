import { BrowserWindow, ipcMain } from "electron";

import type { IpcHandlerProps } from "./types";

import { channel } from "./channel";

export function registerWindowHandlers({ mainWindow, miniWindow }: IpcHandlerProps) {
  ipcMain.handle(channel.window.switchToMini, () => {
    if (mainWindow) {
      mainWindow.hide();
    }
    if (miniWindow) {
      miniWindow.show();
    }
  });

  ipcMain.handle(channel.window.switchToMain, () => {
    if (miniWindow) {
      miniWindow.hide();
    }
    if (mainWindow) {
      mainWindow.show();
    }
  });

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
}
