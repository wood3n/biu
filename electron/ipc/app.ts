import { app, ipcMain, session } from "electron";
import isDev from "electron-is-dev";
import log from "electron-log";

import { autoUpdater } from "../updater";
import { channel } from "./channel";

export const applyProxySettings = async (proxySettings?: ProxySettings) => {
  try {
    if (!proxySettings || proxySettings.type === "none") {
      await session.defaultSession.setProxy({ mode: "direct" });
      return;
    }

    const { type, host, port, username, password } = proxySettings;

    if (!host || !port) {
      await session.defaultSession.setProxy({ mode: "direct" });
      return;
    }

    const scheme = type === "http" ? "http" : type === "socks4" ? "socks4" : "socks5";

    const auth =
      username && password
        ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`
        : username
          ? `${encodeURIComponent(username)}@`
          : "";

    const proxyRules = `${scheme}://${auth}${host}:${port}`;

    await session.defaultSession.setProxy({ proxyRules });
  } catch (error) {
    log.error("[proxy] Failed to apply proxy settings:", error);
  }
};

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

  ipcMain.handle(channel.app.isDev, async () => {
    return isDev;
  });

  ipcMain.handle(channel.app.setProxySettings, async (_, proxySettings: ProxySettings) => {
    await applyProxySettings(proxySettings);
  });
}
