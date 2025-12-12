import { ipcMain } from "electron";

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
    if (name === "app-settings") {
      appSettingsStore.set(value);
    }

    if (name === "user-login-info") {
      userStore.set(value);
    }

    if (name === "media-downloads") {
      mediaDownloadsStore.set(value);
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
