import { ipcMain } from "electron";

import { channel } from "./channel";
import { DownloadQueue } from "./download/download-queue";

const downloadQueue = new DownloadQueue();

export function registerDownloadHandlers() {
  ipcMain.handle(channel.download.add, async (_, mediaItem: MediaDownloadParams) => {
    return downloadQueue.addTask(mediaItem);
  });

  ipcMain.handle(channel.download.addList, async (_, mediaList: MediaDownloadParams[]) => {
    return downloadQueue.addTasks(mediaList);
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

  ipcMain.handle(channel.download.sync, async () => {
    const tasks = downloadQueue.getAllTasks();
    return tasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as any);
  });
}
