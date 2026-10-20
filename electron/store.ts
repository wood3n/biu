import { app } from "electron";
import Store from "electron-store";

import { defaultAppSettings } from "@shared/settings/app-settings";
import { defaultShortcutSettings } from "@shared/settings/shortcut-settings";
import { StoreNameMap } from "@shared/store";

import type { FullMediaDownloadTask } from "./ipc/download/types";

import { getUserDataPath } from "./utils";

export const appSettingsStore = new Store<{ appSettings: AppSettings }>({
  name: StoreNameMap.AppSettings,
  cwd: getUserDataPath(),
  defaults: {
    appSettings: {
      ...defaultAppSettings,
      downloadPath: app.getPath("downloads"),
    },
  },
});

export const userStore = new Store<UserInfo>({
  name: StoreNameMap.UserLoginInfo,
  cwd: getUserDataPath(),
  encryptionKey: StoreNameMap.UserLoginInfo,
});

export const mediaDownloadsStore = new Store<Record<string, FullMediaDownloadTask>>({
  name: StoreNameMap.MediaDownloads,
  cwd: getUserDataPath(),
});

export const shortcutKeyStore = new Store<ShortcutSettings>({
  name: StoreNameMap.ShortcutSettings,
  cwd: getUserDataPath(),
  defaults: {
    ...defaultShortcutSettings,
  },
});

export const lyricsCacheStore = new Store<Record<string, MusicLyrics>>({
  name: StoreNameMap.LyricsCache,
  cwd: getUserDataPath(),
  defaults: {},
});

interface DesktopLyricsStoreData {
  /** 桌面歌词窗口位置尺寸 */
  bounds?: DesktopLyricsBounds;
}

export const desktopLyricsStore = new Store<DesktopLyricsStoreData>({
  name: "desktop-lyrics",
  cwd: getUserDataPath(),
  defaults: {},
});
