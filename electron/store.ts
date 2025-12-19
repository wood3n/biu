import { app } from "electron";
import Store from "electron-store";

import { defaultAppSettings } from "@shared/settings/app-settings";
import { defaultShortcutSettings } from "@shared/settings/shortcut-settings";
import { StoreNameMap } from "@shared/store";

import type { FullMediaDownloadTask } from "./ipc/download/types";

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

export const shortcutKeyStore = new Store<ShortcutSettings>({
  name: StoreNameMap.ShortcutSettings,
  defaults: {
    ...defaultShortcutSettings,
  },
});
