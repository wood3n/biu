import { ipcMain } from "electron";
import log from "electron-log";

import { appSettingsStore, userStore, mediaDownloadsStore } from "../store";
import { channel } from "./channel";

export function registerStoreHandlers() {
  ipcMain.handle(channel.store.get, async (_, name: StoreName) => {
    if (name === "app-settings") {
      return appSettingsStore.store;
    }

    if (name === "user-login-info") {
      return userStore.store;
    }

    if (name === "media-downloads") {
      return mediaDownloadsStore.store;
    }
  });

  ipcMain.handle(channel.store.set, async (_, name: StoreName, value: any) => {
    try {
      // 确保 value 是有效对象，防止 electron-store 报错
      if (value === null || value === undefined) {
        log.warn(`[store:set] Received invalid value for ${name}:`, value);
        return;
      }

      if (name === "app-settings") {
        appSettingsStore.set(value);
      }

      if (name === "user-login-info") {
        userStore.set(value);
      }

      if (name === "media-downloads") {
        mediaDownloadsStore.set(value);
      }
    } catch (err) {
      log.error(`[store:set] Error setting store ${name}:`, err);
    }
  });

  ipcMain.handle(channel.store.clear, async (_, name: StoreName) => {
    if (name === "app-settings") {
      appSettingsStore.clear();
    }

    if (name === "user-login-info") {
      userStore.clear();
    }

    if (name === "media-downloads") {
      mediaDownloadsStore.clear();
    }

    return true;
  });
}
