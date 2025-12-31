import { StoreNameMap } from "../store";

declare global {
  type MediaDownloadsData = Record<string, any>;
  type LyricsCacheEntry = {
    provider: string;
    raw: string;
    fetchedAt: number;
    title?: string;
    artist?: string;
  };
  type LyricsTitleMapEntry = {
    title?: string;
    artist?: string;
  };
  type LyricsCacheStore = {
    titles: Record<string, LyricsTitleMapEntry | string>;
    lyrics: Record<string, LyricsCacheEntry>;
    offsets: Record<string, number>;
  };

  type StoreDataMap = {
    [StoreNameMap.AppSettings]: { appSettings: AppSettings };
    [StoreNameMap.UserLoginInfo]: UserInfo;
    [StoreNameMap.ShortcutSettings]: ShortcutSettings;
    [StoreNameMap.MediaDownloads]: MediaDownloadsData;
    [StoreNameMap.LyricsCache]: LyricsCacheStore;
  };
}

export {};
