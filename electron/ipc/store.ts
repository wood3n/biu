import { ipcMain } from "electron";

import { store, storeKey } from "../store";
import { channel } from "./channel";

export function registerStoreHandlers() {
  ipcMain.handle(channel.store.getSettings, async () => {
    return store.get(storeKey.appSettings);
  });

  ipcMain.handle(channel.store.setSettings, async (_, value: AppSettings) => {
    store.set(storeKey.appSettings, value);
    return true;
  });

  ipcMain.handle(channel.store.clearSettings, async () => {
    store.delete(storeKey.appSettings);
    return true;
  });
}
