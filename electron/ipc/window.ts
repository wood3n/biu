import { BrowserWindow, ipcMain } from "electron";

import { channel } from "./channel";

let mainWindow: BrowserWindow | null = null;
let miniWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow | null) {
  mainWindow = win;
}

export function setMiniWindow(win: BrowserWindow | null) {
  miniWindow = win;
}

export function getMainWindow() {
  return mainWindow;
}

export function getMiniWindow() {
  return miniWindow;
}

export function registerWindowHandlers() {
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
}
