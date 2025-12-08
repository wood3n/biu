import { ipcMain } from "electron";

import type { IpcHandlerProps } from "./types";

import { createMiniPlayer, destroyMiniPlayer } from "../mini-player";
import { channel } from "./channel";

export const registerMiniPlayerHandlers = ({ getMainWindow }: IpcHandlerProps) => {
  ipcMain.handle(channel.window.switchToMini, () => {
    const mainWindow = getMainWindow?.();
    if (mainWindow) {
      mainWindow.hide();
    }

    createMiniPlayer();
  });

  ipcMain.handle(channel.window.switchToMain, () => {
    destroyMiniPlayer();
    const mainWindow = getMainWindow?.();
    mainWindow?.show();
  });
};
