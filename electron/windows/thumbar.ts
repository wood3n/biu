import { BrowserWindow, ipcMain, nativeImage } from "electron";
import path from "node:path";

import { ELECTRON_ICON_BASE_PATH } from "@shared/path";

import { channel } from "../ipc/channel";
import { IconBase } from "../path";

const iconPrev = nativeImage.createFromPath(path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, "prev.png"));
const iconNext = nativeImage.createFromPath(path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, "next.png"));
const iconPlay = nativeImage.createFromPath(path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, "play.png"));
const iconPause = nativeImage.createFromPath(path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, "pause.png"));

/**
 * 在 Windows 上设置任务栏缩略按钮，并根据播放状态动态更新播放/暂停按钮。
 * 返回一个清理句柄用于取消事件监听。
 */
export function setupWindowsThumbar(win: BrowserWindow) {
  const ensureThumbBar = (isPlaying: boolean) => {
    win.setThumbarButtons([
      {
        tooltip: "上一首",
        icon: iconPrev,
        click: () => win.webContents.send(channel.player.prev),
      },
      {
        tooltip: isPlaying ? "暂停" : "播放",
        icon: isPlaying ? iconPause : iconPlay,
        click: () => win.webContents.send(channel.player.toggle),
      },
      {
        tooltip: "下一首",
        icon: iconNext,
        click: () => win.webContents.send(channel.player.next),
      },
    ]);
  };

  // 初始化按钮（默认未播放）
  ensureThumbBar(false);

  ipcMain.on(channel.player.state, (_, isPlaying) => {
    ensureThumbBar(!!isPlaying);
  });
}
