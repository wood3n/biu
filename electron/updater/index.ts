import { BrowserWindow } from "electron";
import isDev from "electron-is-dev";
import log from "electron-log";
import electronUpdater, { type UpdateDownloadedEvent } from "electron-updater";
import path from "node:path";

import { channel } from "../ipc/channel";

const { autoUpdater } = electronUpdater;

let checkForUpdatesInterval: NodeJS.Timeout | null = null;
function setupAutoUpdater({ getMainWindow }: { getMainWindow: () => BrowserWindow | null }) {
  autoUpdater.logger = log;
  log.transports.file.level = "info";
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.autoRunAppAfterInstall = true;
  autoUpdater.allowPrerelease = true;

  if (isDev) {
    autoUpdater.updateConfigPath = path.resolve(process.cwd(), "electron/updater/dev-app-update.yml");
    autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.autoRunAppAfterInstall = false;
  }

  autoUpdater.on("update-available", info => {
    const mainWindow = getMainWindow();
    mainWindow?.webContents.send(channel.app.onUpdateAvailable, {
      latestVersion: info.version,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on("download-progress", progressObj => {
    const mainWindow = getMainWindow();
    mainWindow?.webContents.send(channel.app.updateMessage, {
      status: "downloading",
      processInfo: progressObj,
    });
  });

  autoUpdater.on("error", error => {
    const mainWindow = getMainWindow();
    mainWindow?.webContents.send(channel.app.updateMessage, {
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  });

  autoUpdater.on("update-downloaded", (info: UpdateDownloadedEvent) => {
    const mainWindow = getMainWindow();
    mainWindow?.webContents.send(channel.app.updateMessage, {
      status: "downloaded",
      downloadInfo: {
        filePath: info.downloadedFile,
      },
    });
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
