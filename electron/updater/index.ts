import type { BrowserWindow } from "electron";

import { dialog } from "electron";
import log from "electron-log";
import electronUpdater from "electron-updater";

export interface AutoUpdaterOptions {
  getMainWindow: () => BrowserWindow | null | undefined;
  autoDownload?: boolean; // default false
}

export interface AutoUpdaterController {
  checkForUpdates: () => Promise<void>;
  dispose: () => void;
}

export function setupAutoUpdater(options: AutoUpdaterOptions): AutoUpdaterController {
  const { getMainWindow, autoDownload = false } = options;
  const autoUpdater = electronUpdater.autoUpdater;

  // 基础配置
  autoUpdater.logger = log;
  try {
    // 某些运行环境下 transports 可能未初始化，做保护
    log.transports.file.level = "info";
  } catch (err) {
    // 修改说明：初始化日志级别失败时记录警告，避免静默
    log.warn("[autoUpdater] set log level failed:", err);
  }
  autoUpdater.autoDownload = autoDownload;

  // 事件监听
  const onCheckingForUpdate = () => {
    log.info("[autoUpdater] checking for update");
  };

  const onUpdateAvailable = async () => {
    log.info("[autoUpdater] update available");
    const win = getMainWindow();
    try {
      const { response } = await dialog.showMessageBox(win!, {
        type: "info",
        buttons: ["立即下载", "稍后"],
        title: "发现新版本",
        message: "检测到新版本，是否下载并安装？",
      });
      if (response === 0) {
        await autoUpdater.downloadUpdate();
      }
    } catch (err) {
      log.error("[autoUpdater] dialog error:", err);
    }
  };

  const onUpdateNotAvailable = () => {
    log.info("[autoUpdater] no update available");
  };

  const onDownloadProgress = (progress: any) => {
    const percent = Math.round(progress?.percent ?? 0);
    const bps = Math.round(progress?.bytesPerSecond || 0);
    log.info(`[autoUpdater] downloading: ${percent}% (${bps} B/s)`);
  };

  const onError = (error: any) => {
    log.error("[autoUpdater] error:", error);
  };

  const onUpdateDownloaded = async () => {
    log.info("[autoUpdater] update downloaded");
    const win = getMainWindow();
    try {
      const { response } = await dialog.showMessageBox(win!, {
        type: "info",
        buttons: ["重启安装", "稍后"],
        title: "更新就绪",
        message: "更新已下载，是否重启安装？",
      });
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    } catch (err) {
      log.error("[autoUpdater] dialog error:", err);
    }
  };

  autoUpdater.on("checking-for-update", onCheckingForUpdate);
  autoUpdater.on("update-available", onUpdateAvailable);
  autoUpdater.on("update-not-available", onUpdateNotAvailable);
  autoUpdater.on("download-progress", onDownloadProgress);
  autoUpdater.on("error", onError);
  autoUpdater.on("update-downloaded", onUpdateDownloaded);

  return {
    checkForUpdates: async () => {
      try {
        await autoUpdater.checkForUpdates();
      } catch (err) {
        log.error("[autoUpdater] check failed:", err);
        throw err;
      }
    },
    dispose: () => {
      try {
        autoUpdater.removeAllListeners();
      } catch (err) {
        // 修改说明：清理自动更新事件监听失败时记录警告，避免静默
        log.warn("[autoUpdater] removeAllListeners failed:", err);
      }
    },
  };
}
