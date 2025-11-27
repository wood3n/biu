import { app, ipcMain } from "electron";

import { autoUpdater } from "../updater";
import { channel } from "./channel";

export function registerAppHandlers() {
  ipcMain.handle(channel.app.getVersion, async () => {
    return app.getVersion();
  });

  ipcMain.handle(channel.app.checkUpdate, async (): Promise<CheckAppUpdateResult> => {
    const currentVersion = app.getVersion();
    try {
      const res = await autoUpdater.checkForUpdates();

      if (res?.updateInfo && res?.updateInfo?.version && res.updateInfo.version !== currentVersion) {
        return {
          hasUpdate: true,
          isUpdateAvailable: res?.isUpdateAvailable,
          latestVersion: res?.updateInfo?.version as string,
          releaseNotes: res?.updateInfo?.releaseNotes as string,
        };
      }

      return {
        hasUpdate: false,
      };
    } catch (error) {
      return {
        hasUpdate: false,
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
