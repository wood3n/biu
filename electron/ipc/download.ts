import { ipcMain } from "electron";

import type { IpcHandlerProps } from "./types";

import { channel } from "./channel";
import { DownloadQueue } from "./download/download-queue";

let downloadQueue: DownloadQueue;

export function registerDownloadHandlers({ getMainWindow }: IpcHandlerProps) {
  downloadQueue = new DownloadQueue(getMainWindow);

  ipcMain.handle(channel.download.getList, async () => {
    return downloadQueue.getTaskList();
  });

  ipcMain.handle(channel.download.add, async (_, task: MediaDownloadTask) => {
    return downloadQueue.addTask(task);
  });

  ipcMain.handle(channel.download.addList, async (_, tasks: MediaDownloadTask[]) => {
    return downloadQueue.addTasks(tasks);
  });

  ipcMain.handle(channel.download.pause, async (_, id: string) => {
    downloadQueue.pauseTask(id);
  });

  ipcMain.handle(channel.download.resume, async (_, id: string) => {
    downloadQueue.resumeTask(id);
  });

  ipcMain.handle(channel.download.cancel, async (_, id: string) => {
    await downloadQueue.cancelTask(id);
  });

  ipcMain.handle(channel.download.retry, async (_, id: string) => {
    downloadQueue.retryTask(id);
  });

  ipcMain.handle(channel.download.clear, async () => {
    await downloadQueue.clearTasks();
  });
}

export function quitAndSaveTasks() {
  downloadQueue.quitAndSave();
}
