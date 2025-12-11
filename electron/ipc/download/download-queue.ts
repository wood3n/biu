import type { BrowserWindow } from "electron";

import PQueue from "p-queue";

import type { DownloadTask, DownloadOptions, DownloadStatus } from "./types";

import { DownloadCore } from "./download-core";

export class DownloadQueue {
  private queue: PQueue;
  private activeDownloads: Map<string, DownloadCore>;
  private getMainWindow: () => BrowserWindow | null;

  constructor(getMainWindow: () => BrowserWindow | null) {
    this.queue = new PQueue({ concurrency: 3 });
    this.activeDownloads = new Map();
    this.getMainWindow = getMainWindow;

    this.restoreQueue();
  }

  private restoreQueue() {
    const downloads = this.store.get("downloads");
    if (downloads) {
      Object.values(downloads).forEach(task => {
        if (task.status === DownloadStatus.DOWNLOADING || task.status === DownloadStatus.CONVERTING) {
          task.status = DownloadStatus.PAUSED;
          this.saveTask(task);
        }
      });
    }
  }

  public addTask(options: DownloadOptions): string {
    const task: DownloadTask = {
      id,
      options,
      status: DownloadStatus.WAITING,
      progress: {
        totalBytes: 0,
        downloadedBytes: 0,
        percent: 0,
        speed: 0,
        eta: 0,
      },
      createdTime: Date.now(),
      updatedTime: Date.now(),
      retryCount: 0,
    };

    this.saveTask(task);
    this.queueTask(task);
    return id;
  }

  public resumeTask(id: string) {
    const task = this.getTask(id);
    if (task && task.status !== DownloadStatus.COMPLETED && task.status !== DownloadStatus.DOWNLOADING) {
      task.status = DownloadStatus.WAITING;
      this.saveTask(task);
      this.queueTask(task);
    }
  }

  public pauseTask(id: string) {
    const core = this.activeDownloads.get(id);
    if (core) {
      core.pause();
    } else {
      const task = this.getTask(id);
      if (task && task.status === DownloadStatus.WAITING) {
        task.status = DownloadStatus.PAUSED;
        this.saveTask(task);
        this.emit("status", task);
      }
    }
  }

  public cancelTask(id: string) {
    const core = this.activeDownloads.get(id);
    if (core) {
      core.cancel();
    }
    const task = this.getTask(id);
    if (task) {
      task.status = DownloadStatus.CANCELLED;
      this.saveTask(task);
      this.emit("status", task);
    }
  }

  private queueTask(task: DownloadTask) {
    this.queue.add(async () => {
      // Re-fetch task to ensure latest status (e.g. cancelled while in queue)
      const currentTask = this.getTask(task.id);
      if (!currentTask || currentTask.status !== DownloadStatus.WAITING) return;

      const core = new DownloadCore(currentTask);
      this.activeDownloads.set(task.id, core);

      // Setup listeners
      core.on("progress", updatedTask => {
        this.saveTask(updatedTask);
        this.emit("progress", updatedTask);
      });
      core.on("status", updatedTask => {
        this.saveTask(updatedTask);
        this.emit("status", updatedTask);
        if (
          updatedTask.status === DownloadStatus.COMPLETED ||
          updatedTask.status === DownloadStatus.CANCELLED ||
          updatedTask.status === DownloadStatus.ERROR ||
          updatedTask.status === DownloadStatus.PAUSED
        ) {
          this.activeDownloads.delete(task.id);
        }
      });
      core.on("error", updatedTask => {
        this.saveTask(updatedTask);
        this.emit("error", updatedTask);
        this.activeDownloads.delete(task.id);
      });
      core.on("completed", updatedTask => {
        this.saveTask(updatedTask);
        this.emit("completed", updatedTask);
        this.activeDownloads.delete(task.id);
      });

      await core.start();
    });
  }
}
