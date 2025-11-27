import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import log from "electron-log";
import electronUpdater from "electron-updater";
import path from "path";

import { channel } from "../ipc/channel";

const { autoUpdater } = electronUpdater;

let checkForUpdatesInterval: NodeJS.Timeout | null = null;
function setupAutoUpdater() {
  autoUpdater.logger = log;
  log.transports.file.level = "info";
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.autoRunAppAfterInstall = true;
  autoUpdater.allowPrerelease = true;

  if (isDev) {
    autoUpdater.updateConfigPath = path.resolve(process.cwd(), "electron/updater/dev-app-update.yml");
    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.autoRunAppAfterInstall = false;
  }

  autoUpdater.on("update-downloaded", e => {
    BrowserWindow.getAllWindows().forEach(w =>
      w.webContents.send(channel.app.updateMessage, {
        type: "downloaded",
        releaseInfo: {
          latestVersion: e?.version,
          releaseNotes: e?.releaseNotes,
        },
      }),
    );
  });

  autoUpdater.checkForUpdates();
  checkForUpdatesInterval = setInterval(
    () => {
      autoUpdater.checkForUpdates();
    },
    1 * 60 * 60 * 1000,
  );
}

const stopCheckForUpdates = () => {
  if (checkForUpdatesInterval) {
    clearInterval(checkForUpdatesInterval);
    checkForUpdatesInterval = null;
  }
};

export { autoUpdater, setupAutoUpdater, stopCheckForUpdates };
