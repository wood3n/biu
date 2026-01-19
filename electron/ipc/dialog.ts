import type { IpcMainInvokeEvent } from "electron";

import { ipcMain, shell, dialog } from "electron";
import log from "electron-log";
import fs from "node:fs";
import path from "node:path";

import { appSettingsStore } from "../store";
import { channel } from "./channel";

export function registerDialogHandlers() {
  ipcMain.handle(channel.dialog.openDirectory, async (_event: IpcMainInvokeEvent, dir?: string) => {
    const targetDir: string =
      dir ?? appSettingsStore.get("appSettings")?.downloadPath ?? path.resolve(process.cwd(), "downloads");
    const err = await shell.openPath(targetDir);
    return err === "";
  });

  ipcMain.handle(channel.dialog.showFileInFolder, (_event: IpcMainInvokeEvent, filePath: string) => {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error("文件路径不存在");
    }
    shell.showItemInFolder(filePath);
    return true;
  });

  ipcMain.handle(channel.dialog.openExternal, async (_event: IpcMainInvokeEvent, url: string) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (err) {
      // 修改说明：外部链接打开失败时记录错误并返回失败
      log.error("[dialog] openExternal failed:", err);
      return false;
    }
  });

  ipcMain.handle(channel.dialog.selectDirectory, async (_event: IpcMainInvokeEvent, title?: string) => {
    const resolvedTitle = title?.trim() || "选择目录";
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
      title: resolvedTitle,
    });
    if (result.canceled) return null;
    const dir = result.filePaths?.[0] ?? null;
    return dir;
  });

  ipcMain.handle(channel.dialog.selectFile, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      title: "选择文件",
    });
    if (result.canceled) return null;
    return result.filePaths?.[0] ?? null;
  });
}
