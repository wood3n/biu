import type { StoreNameMap } from "../store";

declare global {
  type MediaDownloadsData = Record<string, any>;

  type StoreDataMap = {
    [StoreNameMap.AppSettings]: { appSettings: AppSettings };
    [StoreNameMap.UserLoginInfo]: UserInfo;
    [StoreNameMap.ShortcutSettings]: ShortcutSettings;
  };
}

export {};
