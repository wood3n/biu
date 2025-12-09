import type { BrowserWindow, MenuItemConstructorOptions } from "electron";

import { Tray, nativeImage, Menu } from "electron";
import log from "electron-log";
import path from "node:path";

import { ELECTRON_ICON_BASE_PATH } from "@shared/path";

import { channel } from "./ipc/channel";
import { destroyMiniPlayer } from "./mini-player";
import { IconBase } from "./utils";

interface Props {
  getMainWindow: () => BrowserWindow | null;
  onExit: () => void;
}

/**
 * Windows、Linux 系统托盘
 * - 左键：显示/隐藏主窗口
 * - 右键：弹出上下文菜单（显示/隐藏、退出）
 * 通过传入 getMainWindow 和 onExit 回调与主进程解耦，便于复用与测试。
 */
let tray: Tray | null = null;

function createTray({ getMainWindow, onExit }: Props) {
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

  const sendWindowCommand = (channel: string, errorContext: string) => {
    return () => {
      const win = getMainWindow?.();
      // 增加 isDestroyed 检查以提高健壮性
      if (!win || win.isDestroyed()) {
        return;
      }
      try {
        win.webContents.send(channel);
      } catch (err) {
        log.error(`[tray] ${errorContext} failed:`, err);
      }
    };
  };

  // 通用的窗口操作处理函数生成器
  const createWindowActionHandler = (action: (win: BrowserWindow) => void, errorContext: string) => {
    return () => {
      const win = getMainWindow?.();
      if (!win || win.isDestroyed()) return;
      try {
        win.show();
        win.focus();
        action(win);
      } catch (err) {
        log.error(`[tray] ${errorContext} failed:`, err);
      }
    };
  };

  /**
   * 切换主窗口的显示/隐藏状态
   */
  const toggleMainWindowVisibility = () => {
    const win = getMainWindow?.();
    if (!win || win.isDestroyed()) return;
    try {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
        win.focus();
      }
    } catch (err) {
      log.error("[tray] toggle main window visibility failed:", err);
    }
  };

  const menuTemplate: MenuItemConstructorOptions[] = [
    {
      label: "播放/暂停",
      click: sendWindowCommand(channel.player.toggle, "toggle play"),
    },
    {
      label: "上一曲",
      click: sendWindowCommand(channel.player.prev, "play previous"),
    },
    {
      label: "下一曲",
      click: sendWindowCommand(channel.player.next, "play next"),
    },
    {
      label: "显示/隐藏界面",
      click: toggleMainWindowVisibility,
    },
    {
      label: "切换账号",
      click: createWindowActionHandler(win => win.webContents.send(channel.user.switchAccount), "switch account"),
    },
    {
      type: "separator",
    },
    {
      label: "设置",
      click: createWindowActionHandler(
        win => win.webContents.send(channel.router.navigate, "/settings"),
        "navigate to settings",
      ),
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
    destroyMiniPlayer();
    const win = getMainWindow?.();
    if (!win || win.isDestroyed()) return;
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
