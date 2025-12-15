import { app, ipcMain } from "electron";

import { autoUpdater } from "../updater";
import { channel } from "./channel";

export function registerAppHandlers() {
  ipcMain.handle(channel.app.getVersion, async () => {
    return app.getVersion();
  });

  ipcMain.handle(channel.app.checkUpdate, async (): Promise<CheckAppUpdateResult> => {
    try {
      const res = await autoUpdater.checkForUpdates();

      if (res?.isUpdateAvailable) {
        return {
          isUpdateAvailable: res?.isUpdateAvailable,
          latestVersion: res?.updateInfo?.version as string,
          releaseNotes: res?.updateInfo?.releaseNotes as string,
        };
      }

      return {
        isUpdateAvailable: false,
      };
    } catch (error) {
      return {
        isUpdateAvailable: false,
        error: String(error instanceof Error ? error?.message : "无法获取更新信息"),
      };
    }
  });

  ipcMain.handle(channel.app.downloadUpdate, async () => {
    await autoUpdater.downloadUpdate();
  });

  ipcMain.handle(channel.app.quitAndInstall, async () => {
    return autoUpdater.quitAndInstall();
  });
}
