import { app, BrowserWindow, ipcMain, Menu } from "electron";

import { channel } from "../ipc/channel";

export function setupMacDock(win: BrowserWindow) {
  const setDockMenu = (isPlaying: boolean) => {
    const dockMenu = Menu.buildFromTemplate([
      {
        label: isPlaying ? "暂停" : "播放",
        click: () => win.webContents.send(channel.player.toggle),
      },
      {
        label: "上一首",
        click: () => win.webContents.send(channel.player.prev),
      },
      {
        label: "下一首",
        click: () => win.webContents.send(channel.player.next),
      },
    ]);
    app.dock?.setMenu(dockMenu);
  };

  // 初始化
  setDockMenu(false);

  // 监听播放状态
  ipcMain.on(channel.player.state, (_, isPlaying) => {
    setDockMenu(!!isPlaying);
  });
}
