import { Tray, nativeImage, Menu } from "electron";
import path from "node:path";

import { channel } from "./ipc/channel.mjs";

/**
 * Windows 系统托盘
 * - 左键：显示/隐藏主窗口
 * - 右键：弹出上下文菜单（显示/隐藏、退出）
 * 通过传入 getMainWindow 和 onExit 回调与主进程解耦，便于复用与测试。
 */
let tray;

function createTray({ getMainWindow, onExit } = {}) {
  // 仅在 Windows 创建托盘
  if (process.platform !== "win32") return null;

  // 若已存在旧实例，先销毁避免重复创建
  if (tray) {
    try {
      tray.destroy();
    } catch {}
    tray = null;
  }

  const trayIcon = nativeImage.createFromPath(path.resolve(process.cwd(), "electron/icons/win/tray.ico"));
  trayIcon.setTemplateImage(true);

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
    const menuTemplate = [
      {
        label: "设置",
        click: () => {
          const win = getMainWindow?.();
          if (!win) return;
          try {
            win.show();
            win.focus();
            win.webContents.send(channel.router.navigate, "/settings");
          } catch {}
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
    tray.popUpContextMenu(menu);
  });

  return tray;
}

function destroyTray() {
  if (tray) {
    try {
      tray.destroy();
    } catch {}
    tray = null;
  }
}

export { tray, createTray, destroyTray };
