import type { BrowserWindow } from "electron";

import { throttle } from "es-toolkit/compat";
import { randomUUID } from "node:crypto";
import PQueue from "p-queue";

import { channel } from "../channel";
import { mediaDownloadsStore } from "./../../store";
import { DownloadCore } from "./download-core";

export class DownloadQueue {
  private queue: PQueue;
  private activeDownloads: Map<string, DownloadCore>;
  private controllers: Map<string, AbortController>;
  private getMainWindow: () => BrowserWindow | null;
  private pendingUpdates: Map<string, MediaDownloadTask>;
  private flushUpdates: () => void;

  constructor(getMainWindow: () => BrowserWindow | null) {
    this.queue = new PQueue({ concurrency: 3 });
    this.activeDownloads = new Map();
    this.controllers = new Map();
    this.getMainWindow = getMainWindow;
    this.pendingUpdates = new Map();

    this.flushUpdates = throttle(() => {
      if (this.pendingUpdates.size > 0) {
        const updates = Array.from(this.pendingUpdates.values());
        this.broadcast("update", updates);
        this.pendingUpdates.clear();
      }
    }, 500);

    this.restoreQueue();
  }

  private restoreQueue() {
    const downloads = mediaDownloadsStore.store;
    if (downloads && Object.keys(downloads).length > 0) {
      Object.values(downloads).forEach(task => {
        if (["downloading", "merging", "converting"].includes(task.status)) {
          task.status = "paused";
          this.saveTask(task);
        }
      });
    }
  }

  public addTask(mediaInfo: MediaDownloadInfo): string {
    const id = randomUUID();

    const task: MediaDownloadTask = {
      id,
      outputFileType: mediaInfo.outputFileType,
      title: mediaInfo.title,
      cover: mediaInfo.cover,
      bvid: mediaInfo.bvid,
      cid: mediaInfo.cid,
      sid: mediaInfo.sid,
      createdTime: Date.now(),
      status: "waiting",
    };

    this.saveTask(task);
    this.queueTask(task);
    return id;
  }

  public addTasks(mediaInfos: MediaDownloadInfo[]) {
    mediaInfos.forEach(mediaInfo => this.addTask(mediaInfo));
  }

  public resumeTask(id: string) {
    const task = this.getTask(id);
    if (task && task.status !== "completed" && task.status !== "downloading") {
      task.status = "waiting";
      this.saveTask(task);
      this.queueTask(task);
    }
  }

  public pauseTask(id: string) {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.abort();
    }

    const activeDownload = this.activeDownloads.get(id);
    if (activeDownload) {
      activeDownload.pause();
    }
  }

  public cancelTask(id: string) {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.abort();
    }

    const activeDownload = this.activeDownloads.get(id);
    if (activeDownload) {
      activeDownload.cancel();
    }
  }

  private broadcast(type: "full" | "update" = "full", data?: any) {
    const window = this.getMainWindow();
    if (window) {
      const payload = type === "full" ? { type: "full", data: this.getAllTasks() } : { type: "update", data };
      window.webContents.send(channel.download.sync, payload);
    }
  }

  private updateTask(id: string, updates: Partial<MediaDownloadTask>) {
    const task = this.getTask(id);
    if (task) {
      const updatedTask = { ...task, ...updates };
      this.saveTask(updatedTask, true);
      this.pendingUpdates.set(id, updatedTask);
      this.flushUpdates();
    }
  }

  private queueTask(task: MediaDownloadTask) {
    const controller = new AbortController();
    this.controllers.set(task.id, controller);

    this.queue.add(
      async () => {
        const core = new DownloadCore(task, controller.signal);
        this.activeDownloads.set(task.id, core);

        // Setup listeners
        core.on("statusChange", ({ status }) => {
          this.updateTask(task.id, { status });
          if (status === "completed" || status === "paused" || status === "error") {
            this.activeDownloads.delete(task.id);
          }
        });

        core.on("downloadProgress", ({ progress }) => {
          this.updateTask(task.id, { downloadProgress: progress });
        });

        core.on("mergeProgress", ({ progress }) => {
          this.updateTask(task.id, { mergeProgress: progress });
        });

        core.on("convertProgress", ({ progress }) => {
          this.updateTask(task.id, { convertProgress: progress });
        });

        core.on("error", ({ error }) => {
          this.updateTask(task.id, { error, status: "failed" });
          this.activeDownloads.delete(task.id);
        });

        await core.start();
      },
      {
        signal: controller.signal,
      },
    );
  }

  public retryTask(id: string) {
    const task = this.getTask(id);
    if (task) {
      task.status = "waiting";
      this.saveTask(task);
      this.queueTask(task);
    }
  }

  private saveTask(task: MediaDownloadTask, skipBroadcast = false) {
    mediaDownloadsStore.set(`downloads.${task.id}`, task);
    if (!skipBroadcast) {
      this.broadcast();
    }
  }

  public getTask(id: string): MediaDownloadTask | undefined {
    return mediaDownloadsStore.get(`downloads.${id}`);
  }

  public getAllTasks(): MediaDownloadTask[] {
    const downloads = mediaDownloadsStore.store;
    return downloads ? Object.values(downloads) : [];
  }

  public clearTasks() {
    mediaDownloadsStore.clear();
    this.broadcast();
  }
}
