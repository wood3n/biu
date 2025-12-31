import { app, globalShortcut, BrowserWindow } from "electron";
import log from "electron-log";

import { channel } from "./ipc/channel";
import { shortcutKeyStore } from "./store";

export function registerAllShortcuts(getMainWindow: () => BrowserWindow | null) {
  if (!app.isReady()) {
    return;
  }
  // Unregister all first to be safe
  globalShortcut.unregisterAll();

  const shortcuts = shortcutKeyStore.get("globalShortcuts");
  const enableGlobalShortcuts = shortcutKeyStore.get("enableGlobalShortcuts");

  if (!enableGlobalShortcuts) {
    return;
  }

  if (!shortcuts || shortcuts.length === 0) {
    return;
  }

  shortcuts.forEach(item => {
    const { id, shortcut: key } = item;
    if (key && key.trim() !== "") {
      try {
        const success = globalShortcut.register(key, () => {
          const win = getMainWindow();
          if (win && !win.isDestroyed()) {
            win.webContents.send(channel.shortcut.triggered, id);
          }
        });

        item.isConflict = !success;
      } catch (error) {
        log.error(`[Shortcut] Error registering ${key}:`, error);
        item.isConflict = true;
      }
    }
  });

  shortcutKeyStore.set("globalShortcuts", shortcuts);
}

export function unregisterAllShortcuts() {
  if (app.isReady()) {
    globalShortcut.unregisterAll();
  }
  const shortcuts = shortcutKeyStore.get("globalShortcuts");
  if (shortcuts) {
    shortcutKeyStore.set(
      "globalShortcuts",
      shortcuts.map(item => ({ ...item, isConflict: false })),
    );
  }
}
