import type { IpcMainInvokeEvent } from "electron";

import { ipcMain, shell, dialog } from "electron";
import path from "node:path";

import { store, storeKey } from "../store";
import { channel } from "./channel";

export function registerDialogHandlers() {
  ipcMain.handle(channel.dialog.openDirectory, async (_event: IpcMainInvokeEvent, dir?: string) => {
    const targetDir: string =
      dir ?? store.get(storeKey.appSettings)?.downloadPath ?? path.resolve(process.cwd(), "downloads");
    const err = await shell.openPath(targetDir);
    return err === "";
  });

  ipcMain.handle(channel.dialog.selectDirectory, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
      title: "选择下载保存目录",
    });
    if (result.canceled) return null;
    const dir = result.filePaths?.[0] ?? null;
    return dir;
  });
}
