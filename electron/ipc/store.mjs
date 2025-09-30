import { ipcMain } from "electron";

import { store, storeKey } from "../store.mjs";
import { channel } from "./channel.mjs";

export function registerStoreHandlers({ app }) {
  // get settings
  ipcMain.handle(channel.store.getSettings, async () => {
    return store.get(storeKey.appSettings);
  });

  // set settings
  ipcMain.handle(channel.store.setSettings, async (_, value) => {
    store.set(storeKey.appSettings, value);
    app.setLoginItemSettings({
      openAtLogin: !!value.autoStart,
    });
    return true;
  });

  // clear settings
  ipcMain.handle(channel.store.clearSettings, async () => {
    store.delete(storeKey.appSettings);
    return true;
  });
}
