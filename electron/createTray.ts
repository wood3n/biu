import type { BrowserWindow, MenuItemConstructorOptions } from "electron";

import { Tray, nativeImage, Menu, app } from "electron";
import log from "electron-log";
import path from "node:path";

import { channel } from "./ipc/channel";

/**
 * Windows 系统托盘
 * - 左键：显示/隐藏主窗口
 * - 右键：弹出上下文菜单（显示/隐藏、退出）
 * 通过传入 getMainWindow 和 onExit 回调与主进程解耦，便于复用与测试。
 */
let tray: Tray | null = null;

function createTray({
  getMainWindow,
  onExit,
}: { getMainWindow?: () => BrowserWindow | null; onExit?: () => void } = {}) {
  // 仅在 Windows 创建托盘
  if (process.platform !== "win32") return null;

  // 若已存在旧实例，先销毁避免重复创建
  if (tray) {
    try {
      tray.destroy();
    } catch (err) {
      // 修改说明：销毁旧托盘失败时记录日志，避免静默
      log.warn("[tray] destroy old tray failed:", err);
    }
    tray = null;
  }

  const iconBase = app.isPackaged ? process.resourcesPath : process.cwd();
  const trayIconPath = path.resolve(iconBase, "electron/icons/win/tray.ico");
  let trayIcon = nativeImage.createFromPath(trayIconPath);

  if (trayIcon.isEmpty()) {
    const fallbackPath = path.resolve(iconBase, "electron/icons/win/logo.ico");
    const fallback = nativeImage.createFromPath(fallbackPath);
    if (!fallback.isEmpty()) {
      trayIcon = fallback;
    } else {
      console.error("[tray] icon not found:", trayIconPath, "fallback:", fallbackPath);
      return null;
    }
  }

  tray = new Tray(trayIcon);
  tray.setToolTip("Biu");

  // 左键单击：显示/隐藏主窗口
  tray.on("click", () => {
    const win = getMainWindow?.();
    if (!win) return;
    if (win.isVisible()) {
      if (!win.isFocused()) {
        win.focus();
      }
    } else {
      win.show();
    }
  });

  // 右键：动态构建菜单以反映当前窗口状态
  tray.on("right-click", () => {
    const menuTemplate: MenuItemConstructorOptions[] = [
      {
        label: "设置",
        click: () => {
          const win = getMainWindow?.();
          if (!win) return;
          try {
            win.show();
            win.focus();
            win.webContents.send(channel.router.navigate, "/settings");
          } catch (err) {
            // 修改说明：托盘触发的导航失败时记录错误，便于定位
            log.error("[tray] navigate to settings failed:", err);
          }
        },
      },
      {
        label: "退出程序",
        click: () => {
          // 将退出逻辑交给主进程，以便设置 app.quitting 标记
          if (typeof onExit === "function") {
            onExit();
          }
        },
      },
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    if (!tray) return;
    tray.popUpContextMenu(menu);
  });

  return tray;
}

function destroyTray() {
  if (tray) {
    try {
      tray.destroy();
    } catch (err) {
      // 修改说明：销毁托盘失败时记录日志，避免静默
      log.warn("[tray] destroy tray failed:", err);
    }
    tray = null;
  }
}

export { tray, createTray, destroyTray };
