import { app } from "electron";
import Store from "electron-store";

import { defaultAppSettings } from "@shared/settings/app-settings";
import { defaultShortcutSettings } from "@shared/settings/shortcut-settings";

import type { FullMediaDownloadTask } from "./ipc/download/types";

export const storeKey = {
  appSettings: "appSettings",
  shortcutSettings: "shortcutSettings",
} as const;

export const StoreNameMap: Record<string, StoreName> = {
  AppSettings: "app-settings",
  UserLoginInfo: "user-login-info",
  MediaDownloads: "media-downloads",
  ShortcutSettings: "shortcut-settings",
} as const;

export const appSettingsStore = new Store<{ appSettings: AppSettings }>({
  name: StoreNameMap.AppSettings,
  defaults: {
    appSettings: {
      ...defaultAppSettings,
      downloadPath: app.getPath("downloads"),
    },
  },
});

export const userStore = new Store<UserInfo>({
  name: StoreNameMap.UserLoginInfo,
  encryptionKey: StoreNameMap.UserLoginInfo,
});

export const mediaDownloadsStore = new Store<Record<string, FullMediaDownloadTask>>({
  name: StoreNameMap.MediaDownloads,
});

export const shortcutStore = new Store<{ shortcutSettings: ShortcutSettings }>({
  name: StoreNameMap.ShortcutSettings,
  defaults: {
    shortcutSettings: defaultShortcutSettings,
  },
});
