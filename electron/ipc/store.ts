import { ipcMain } from "electron";
import log from "electron-log";

import { StoreNameMap } from "@shared/store";

import { appSettingsStore, userStore, shortcutKeyStore } from "../store";
import { lyricsCacheStore } from "../store";
import { channel } from "./channel";

export function registerStoreHandlers() {
  ipcMain.handle(channel.store.get, async (_, name: StoreName) => {
    if (name === StoreNameMap.AppSettings) {
      return appSettingsStore.store;
    }

    if (name === StoreNameMap.UserLoginInfo) {
      return userStore.store;
    }

    if (name === StoreNameMap.ShortcutSettings) {
      return shortcutKeyStore.store;
    }

    if (name === "lyrics-cache") {
      return lyricsCacheStore.store;
    }
  });

  ipcMain.handle(channel.store.set, async (_, name: StoreName, value: any) => {
    try {
      // 确保 value 是有效对象，防止 electron-store 报错
      if (value === null || value === undefined) {
        log.warn(`[store:set] Received invalid value for ${String(name)}:`, value);
        return;
      }

      if (name === StoreNameMap.AppSettings) {
        appSettingsStore.set(value);
      }

      if (name === StoreNameMap.UserLoginInfo) {
        userStore.set(value);
      }

      if (name === StoreNameMap.ShortcutSettings) {
        shortcutKeyStore.set(value);
      }

      if (name === "lyrics-cache") {
        lyricsCacheStore.set(value);
      }
    } catch (err) {
      log.error(`[store:set] Error setting store ${String(name)}:`, err);
    }
  });

  ipcMain.handle(channel.store.clear, async (_, name: StoreName) => {
    if (name === StoreNameMap.AppSettings) {
      appSettingsStore.clear();
    }

    if (name === StoreNameMap.UserLoginInfo) {
      userStore.clear();
    }

    if (name === StoreNameMap.ShortcutSettings) {
      shortcutKeyStore.clear();
    }

    if (name === "lyrics-cache") {
      lyricsCacheStore.clear();
    }

    return true;
  });
}
