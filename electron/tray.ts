import type { BrowserWindow, MenuItemConstructorOptions } from "electron";

import { Tray, nativeImage, Menu } from "electron";
import log from "electron-log";
import path from "node:path";

import { ELECTRON_ICON_BASE_PATH } from "@shared/path";

import { channel } from "./ipc/channel";
import { IconBase } from "./path";

/**
 * Windows 系统托盘
 * - 左键：显示/隐藏主窗口
 * - 右键：弹出上下文菜单（显示/隐藏、退出）
 * 通过传入 getMainWindow 和 onExit 回调与主进程解耦，便于复用与测试。
 */
let tray: Tray | null = null;

function createTray({
  getMainWindow,
  getMiniWindow,
  onExit,
}: {
  getMainWindow?: () => BrowserWindow | null;
  getMiniWindow?: () => BrowserWindow | null;
  onExit?: () => void;
} = {}) {
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

  const isLinux = process.platform === "linux";
  const iconName = isLinux ? "logo.png" : "tray.ico";
  const trayIconPath = path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, iconName);
  let icon = nativeImage.createFromPath(trayIconPath);

  if (icon.isEmpty()) {
    log.warn(`[tray] Tray icon not found or failed to load: ${trayIconPath}`);
  }

  // Linux 下为了避免图标过大，调整尺寸（通常 32x32 足够清晰且适配）
  if (isLinux) {
    icon = icon.resize({ width: 32, height: 32 });
  }

  tray = new Tray(icon);
  tray.setToolTip("Biu");

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

  // Linux 下必须使用 setContextMenu 才能正常弹出菜单（尤其是 Wayland/AppIndicator 环境）
  // Windows/macOS 也推荐使用 setContextMenu，系统会自动处理右键行为
  const menu = Menu.buildFromTemplate(menuTemplate);
  tray.setContextMenu(menu);

  // 左键单击：显示主窗口；若迷你窗口已显示，则关闭它
  tray.on("click", () => {
    const miniWin = getMiniWindow?.();
    if (miniWin && miniWin.isVisible()) {
      miniWin.hide();
    }

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

export { createTray, destroyTray };
