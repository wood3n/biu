import { globalShortcut, BrowserWindow } from "electron";
import log from "electron-log";

import { channel } from "./ipc/channel";
import { shortcutKeyStore } from "./store";

export function setupShortcutManager(getMainWindow: () => BrowserWindow | null) {
  const registerShortcuts = () => {
    // Unregister all first to be safe
    globalShortcut.unregisterAll();

    const shortcuts = shortcutKeyStore.get("shortcuts");
    const enableGlobalShortcuts = shortcutKeyStore.get("enableGlobalShortcuts");

    if (!enableGlobalShortcuts) {
      log.info("[Shortcut] Global shortcuts disabled");
      return;
    }

    if (!shortcuts || shortcuts.length === 0) {
      return;
    }

    shortcuts.forEach(item => {
      const { id, globalShortcut: key } = item;
      if (key && key.trim() !== "") {
        try {
          const ret = globalShortcut.register(key, () => {
            log.info(`[Shortcut] Triggered: ${id}`);
            const win = getMainWindow();
            if (win && !win.isDestroyed()) {
              win.webContents.send(channel.shortcut.triggered, id);
            }
          });

          if (!ret) {
            log.warn(`[Shortcut] Failed to register: ${key} for ${id}`);
          }
        } catch (error) {
          log.error(`[Shortcut] Error registering ${key}:`, error);
        }
      }
    });

    log.info("[Shortcut] Global shortcuts registered");
  };

  // Initial registration
  registerShortcuts();

  // Listen for store changes
  const unsubscribeShortcuts = shortcutKeyStore.onDidChange("shortcuts", () => {
    log.info("[Shortcut] Shortcuts config changed, reloading...");
    registerShortcuts();
  });

  const unsubscribeEnable = shortcutKeyStore.onDidChange("enableGlobalShortcuts", () => {
    log.info("[Shortcut] Enable switch changed, reloading...");
    registerShortcuts();
  });

  return () => {
    unsubscribeShortcuts();
    unsubscribeEnable();
    globalShortcut.unregisterAll();
  };
}
