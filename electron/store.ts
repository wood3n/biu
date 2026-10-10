import { app } from "electron";
import Store from "electron-store";
import fs from "node:fs";
import path from "node:path";

import { defaultAppSettings } from "@shared/settings/app-settings";
import { defaultDesktopLyricsSettings } from "@shared/settings/desktop-lyrics-settings";
import { defaultShortcutSettings } from "@shared/settings/shortcut-settings";
import { StoreNameMap } from "@shared/store";

import type { FullMediaDownloadTask } from "./ipc/download/types";

import { getUserDataPath } from "./utils";

/**
 * 修正损坏的存储文件（含 UTF-8 BOM、非法 JSON）。
 * electron-store 在构造时会直接反序列化，带 BOM 或损坏的文件会抛异常导致主进程崩溃，
 * 因此启动前先做一次清理：能修复的（去掉 BOM）直接修好，无法解析的备份为 .bak 后重置。
 */
function sanitizeStoreFile(name: string, cwd: string) {
  const filePath = path.join(cwd, `${name}.json`);

  try {
    if (!fs.existsSync(filePath)) return;

    const raw = fs.readFileSync(filePath, "utf8");
    const content = raw.replace(/^\uFEFF/, "").trim();

    if (!content) return;

    try {
      JSON.parse(content);
    } catch {
      fs.renameSync(filePath, `${filePath}.bak`);

      return;
    }

    if (raw !== content) {
      fs.writeFileSync(filePath, content, "utf8");
    }
  } catch {
    // 读取/写入失败时不阻塞启动，交给 electron-store 使用默认值
  }
}

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

/** 桌面歌词窗口设置（窗口位置、锁定状态、样式） */
const desktopLyricsCwd = getUserDataPath();

sanitizeStoreFile(StoreNameMap.DesktopLyrics, desktopLyricsCwd);

export const desktopLyricsStore = new Store<DesktopLyricsSettings>({
  name: StoreNameMap.DesktopLyrics,
  cwd: desktopLyricsCwd,
  defaults: {
    ...defaultDesktopLyricsSettings,
  },
});
