import { ipcMain, dialog, shell } from "electron";

import { store, storeKey } from "../store.mjs";
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

  // 打开本地文件夹（默认打开设置中的下载目录）
  ipcMain.handle(channel.dialog.openDirectory, async (_, dirPath) => {
    try {
      const target = dirPath || store.get(storeKey.appSettings)?.downloadPath;
      if (!target) return false;
      const res = await shell.openPath(target);
      // shell.openPath 返回空字符串表示成功，否则是错误消息
      return !res;
    } catch (error) {
      console.error("打开文件夹失败", error);
      return false;
    }
  });
}
