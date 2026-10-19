import type { BrowserWindow } from "electron";

import { ipcMain } from "electron";

import { applyDesktopLyricsPayload, getLastDesktopLyricsPayload } from "../desktop-lyrics";
import { updateDesktopLyricsState } from "../windows/tray";
import { channel } from "./channel";

export function registerDesktopLyricsHandlers({ getMainWindow }: { getMainWindow: () => BrowserWindow | null }) {
  // 主窗口同步桌面歌词状态与内容
  ipcMain.on(channel.desktopLyrics.sync, (_, payload: DesktopLyricsPayload) => {
    if (!payload || typeof payload !== "object") return;

    applyDesktopLyricsPayload(payload);
    updateDesktopLyricsState({
      enabled: Boolean(payload.enabled),
      locked: Boolean(payload.locked),
    });
  });

  // 桌面歌词窗口初始化时主动拉取当前内容
  ipcMain.handle(channel.desktopLyrics.getContent, () => getLastDesktopLyricsPayload());

  // 浮窗按钮 -> 主窗口渲染进程（主窗口是设置状态的数据源）
  const forwardToMainWindow = (targetChannel: string) => {
    const win = getMainWindow?.();
    if (!win || win.isDestroyed()) return;

    win.webContents.send(targetChannel);
  };

  ipcMain.on(channel.desktopLyrics.requestToggle, () => {
    forwardToMainWindow(channel.desktopLyrics.toggleRequested);
  });

  ipcMain.on(channel.desktopLyrics.requestToggleLock, () => {
    forwardToMainWindow(channel.desktopLyrics.lockToggleRequested);
  });
}
