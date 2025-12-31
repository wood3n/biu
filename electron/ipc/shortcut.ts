import { app, globalShortcut, ipcMain } from "electron";

import type { IpcHandlerProps } from "./types";

import { registerAllShortcuts, unregisterAllShortcuts } from "../shortcut";
import { shortcutKeyStore } from "../store";
import { channel } from "./channel";

export function registerShortcutHandlers({ getMainWindow }: IpcHandlerProps) {
  ipcMain.handle(channel.shortcut.register, (_, { accelerator, id }) => {
    try {
      if (!app.isReady()) {
        return false;
      }
      const globalShortcuts = shortcutKeyStore.get("globalShortcuts");
      const oldShortcut = globalShortcuts.find(s => s.id === id)?.shortcut;

      if (oldShortcut) {
        globalShortcut.unregister(oldShortcut);
      }

      const handleAction = () => {
        const win = getMainWindow();
        if (win && !win.isDestroyed()) {
          win.webContents.send(channel.shortcut.triggered, id);
        }
      };

      const registerSuccess = globalShortcut.register(accelerator, handleAction);
      return registerSuccess;
    } catch {
      return false;
    }
  });

  // 注销指定快捷键
  ipcMain.handle(channel.shortcut.unregister, (_, id) => {
    if (!app.isReady()) {
      return;
    }
    const globalShortcuts = shortcutKeyStore.get("globalShortcuts");
    const shortcut = globalShortcuts.find(s => s.id === id)?.shortcut;
    if (shortcut) {
      globalShortcut.unregister(shortcut);
    }
  });

  ipcMain.handle(channel.shortcut.unregisterAll, () => {
    unregisterAllShortcuts();
  });

  ipcMain.handle(channel.shortcut.registerAll, () => {
    registerAllShortcuts(getMainWindow);
  });
}
