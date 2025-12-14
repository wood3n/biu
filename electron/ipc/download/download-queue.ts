import type { BrowserWindow } from "electron";

import { throttle } from "es-toolkit/compat";
import { randomUUID } from "node:crypto";
import PQueue from "p-queue";

import type { FullMediaDownloadTask } from "./types";

import { channel } from "../channel";
import { mediaDownloadsStore } from "./../../store";
import { DownloadCore } from "./download-core";
import { getVideoPages } from "./utils";

export class DownloadQueue {
  private queue: PQueue;
  private tasks: Map<string, DownloadCore>;
  private controllers: Map<string, AbortController>;
  private getMainWindow: () => BrowserWindow | null;
  private pendingUpdates: Map<string, MediaDownloadTask>;
  private flushUpdates: () => void;

  constructor(getMainWindow: () => BrowserWindow | null) {
    this.queue = new PQueue({ concurrency: 3 });
    this.tasks = new Map();
    this.controllers = new Map();
    this.getMainWindow = getMainWindow;
    this.pendingUpdates = new Map();

    this.flushUpdates = throttle(() => {
      if (this.pendingUpdates.size > 0) {
        const updates = Array.from(this.pendingUpdates.values());
        this.broadcast({ type: "update", data: updates });
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
        }

        // Restore controller and core
        const controller = new AbortController();
        this.controllers.set(task.id, controller);

        const core = new DownloadCore(task, controller.signal);
        this.queueTask(core);
        this.tasks.set(task.id, core);
      });
    }
  }

  public addTask(mediaInfo: MediaDownloadInfo): string {
    const id = randomUUID();
    const taskData: MediaDownloadTask = {
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
    const controller = new AbortController();
    const core = new DownloadCore(taskData, controller.signal);
    this.tasks.set(id, core);
    this.controllers.set(id, controller);
    this.queueTask(core);
    this.broadcast({ type: "full" });
    return id;
  }

  public addTasks(mediaInfos: MediaDownloadInfo[]) {
    mediaInfos.forEach(mediaInfo => this.addTask(mediaInfo));
  }

  public resumeTask(id: string) {
    const core = this.tasks.get(id);
    if (core && core.status !== "completed" && core.status !== "downloading") {
      // Re-create controller if needed?
      // DownloadCore takes signal in constructor. If we abort a controller, we can't reuse it.
      // If the task was cancelled/aborted, the signal is aborted.
      // We might need to recreate the DownloadCore instance or update its signal if possible.
      // DownloadCore doesn't support updating signal.
      // So we should recreate DownloadCore with new controller.

      const taskData = core.toTask();
      taskData.status = "waiting";

      const newController = new AbortController();
      this.controllers.set(id, newController);

      const newCore = new DownloadCore(taskData, newController.signal);
      this.tasks.set(id, newCore);
      this.queueTask(newCore);
      this.broadcast({ type: "full" });
    }
  }

  public pauseTask(id: string) {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.abort();
    }
    const core = this.tasks.get(id);
    if (core) {
      core.pause();
    }
  }

  public cancelTask(id: string) {
    const controller = this.controllers.get(id);
    if (controller) {
      controller.abort();
      this.controllers.delete(id);
    }

    const core = this.tasks.get(id);
    if (core) {
      core.cancel();
      this.tasks.delete(id);
    }

    this.broadcast({ type: "full" });
  }

  private broadcast({ type, data }: Partial<MediaDownloadBroadcastPayload>) {
    const window = this.getMainWindow();
    if (window) {
      const payload =
        type === "full" ? { type: "full", data: this.getBroadcastTaskDataList() } : { type: "update", data };
      window.webContents.send(channel.download.sync, payload);
    }
  }

  private queueTask(core: DownloadCore) {
    this.queue.add(
      async () => {
        if (core.bvid && !core.cid) {
          const pages = await getVideoPages(core.bvid);
          if (pages.length > 0) {
            if (pages.length === 1) {
              core.cid = pages[0].cid;
            } else {
              this.cancelTask(core.id!);
              pages.forEach(page =>
                this.addTask({
                  outputFileType: core.outputFileType,
                  bvid: core.bvid,
                  cid: page.cid,
                  title: page.title,
                  cover: page.cover,
                }),
              );
            }
          } else {
            throw new Error("无法获取视频分集信息");
          }
        }

        core.on("update", (updateData: any) => {
          this.pendingUpdates.set(core.id!, updateData);
          this.flushUpdates();
        });
        await core.start();
      },
      {
        signal: this.controllers.get(core.id!)?.signal,
      },
    );
  }

  public retryTask(id: string) {
    this.resumeTask(id); // Retry is essentially resume/restart
  }

  public getBroadcastTaskDataList(): MediaDownloadTask[] {
    return Array.from(this.tasks.values()).map(core => ({
      id: core.id!,
      outputFileType: core.outputFileType,
      title: core.title,
      bvid: core.bvid,
      cid: core.cid,
      sid: core.sid,
      cover: core.cover,
      audioCodecs: core.audioCodecs,
      audioBandwidth: core.audioBandwidth,
      videoResolution: core.videoResolution,
      videoFrameRate: core.videoFrameRate,
      savePath: core.savePath,
      status: core.status,
      totalBytes: core.totalBytes,
      downloadProgress: core.downloadProgress,
      mergeProgress: core.mergeProgress,
      convertProgress: core.convertProgress,
      createdTime: core.createdTime,
      error: core.error,
    }));
  }

  public saveAllTasksToStore() {
    this.controllers.forEach(controller => controller.abort());
    const tasksObject: Record<string, FullMediaDownloadTask> = {};
    this.tasks.forEach((core, id) => {
      tasksObject[`downloads.${id}`] = {
        id: core.id,
        outputFileType: core.outputFileType,
        title: core.title,
        cover: core.cover,
        createdTime: core.createdTime,
        bvid: core.bvid,
        cid: core.cid,
        sid: core.sid,
        audioCodecs: core.audioCodecs,
        audioBandwidth: core.audioBandwidth,
        videoUrl: core.videoUrl,
        videoResolution: core.videoResolution,
        videoFrameRate: core.videoFrameRate,
        totalBytes: core.totalBytes,
        downloadedBytes: core.downloadedBytes,
        downloadProgress: core.downloadProgress,
        mergeProgress: core.mergeProgress,
        convertProgress: core.convertProgress,
        status: core.status,
        fileName: core.fileName,
        savePath: core.savePath,
        audioTempPath: core.audioTempPath,
        videoTempPath: core.videoTempPath,
        chunks: core.chunks,
        error: core.error,
      };
    });
    mediaDownloadsStore.store = tasksObject;
  }

  public clearTasks() {
    this.controllers.forEach(controller => controller.abort());
    this.controllers.clear();
    this.tasks.forEach(core => core.cancel());
    this.tasks.clear();
    mediaDownloadsStore.clear();
    this.broadcast({ type: "full" });
  }
}
