import type { BrowserWindow } from "electron";

import { ipcMain } from "electron";

import { applyDesktopLyricsPayload, getLastDesktopLyricsPayload } from "../desktop-lyrics";
import { updateDesktopLyricsState } from "../windows/tray";
import { channel } from "./channel";

/**
 * 注册桌面歌词相关 IPC：
 * - 主窗口 -> 主进程：同步内容快照/开关状态
 * - 桌面歌词窗口 -> 主进程：初始化拉取内容
 * - 桌面歌词窗口按钮 -> 主窗口渲染进程：请求切换显示/锁定（设置数据源在主窗口）
 */
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
  /** 把请求转发给主窗口渲染进程处理 */
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
