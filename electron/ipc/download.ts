import { ipcMain, dialog, BrowserWindow, shell } from "electron";

import type { IpcHandlerProps } from "./types";

import { checkFfmpeg } from "../utils";
import { channel } from "./channel";
import { DownloadQueue } from "./download/download-queue";

let downloadQueue: DownloadQueue;

export const checkFfmpegInstalledAndNotify = async (getMainWindow: () => BrowserWindow | null) => {
  const hasFfmpeg = await checkFfmpeg();
  if (!hasFfmpeg) {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: "warning",
        title: "FFmpeg 未安装",
        message: "检测到您的系统中未安装 FFmpeg，无法进行音视频合并。\n请安装 FFmpeg 并将其添加到系统环境变量中。",
        buttons: ["去下载", "确定"],
        defaultId: 0,
        cancelId: 1,
      });

      if (response === 0) {
        shell.openExternal("https://ffmpeg.org/download.html");
      }
    }
    return false;
  }
  return true;
};

export function registerDownloadHandlers({ getMainWindow }: IpcHandlerProps) {
  downloadQueue = new DownloadQueue(getMainWindow);

  ipcMain.handle(channel.download.getList, async () => {
    return downloadQueue.getBroadcastTaskDataList();
  });

  ipcMain.handle(channel.download.add, async (_, task: MediaDownloadTask) => {
    if (!(await checkFfmpegInstalledAndNotify(getMainWindow))) return;
    return downloadQueue.addTask(task);
  });

  ipcMain.handle(channel.download.addList, async (_, tasks: MediaDownloadTask[]) => {
    if (!(await checkFfmpegInstalledAndNotify(getMainWindow))) return;
    return downloadQueue.addTasks(tasks);
  });

  ipcMain.handle(channel.download.pause, async (_, id: string) => {
    downloadQueue.pauseTask(id);
  });

  ipcMain.handle(channel.download.resume, async (_, id: string) => {
    downloadQueue.resumeTask(id);
  });

  ipcMain.handle(channel.download.cancel, async (_, id: string) => {
    downloadQueue.cancelTask(id);
  });

  ipcMain.handle(channel.download.retry, async (_, id: string) => {
    downloadQueue.retryTask(id);
  });

  ipcMain.handle(channel.download.clear, async () => {
    downloadQueue.clearTasks();
  });
}

export function saveDownloadQueue() {
  downloadQueue.saveAllTasksToStore();
}
