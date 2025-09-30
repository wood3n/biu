import { ipcMain, dialog } from "electron";

import { channel } from "./channel.mjs";

export function registerDialogHandlers() {
  // 选择本地系统目录
  ipcMain.handle(channel.dialog.selectDirectory, async () => {
    const result = await dialog.showOpenDialog({
      title: "选择下载目录",
      properties: ["openDirectory", "createDirectory"],
    });

    if (result.canceled || !result.filePaths?.length) return null;
    return result.filePaths[0];
  });
}
