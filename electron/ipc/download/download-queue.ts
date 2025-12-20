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
  private taskMap: Map<string, DownloadCore>;
  private controllerMap: Map<string, AbortController>;
  private getMainWindow: () => BrowserWindow | null;
  private pendingUpdates: Map<string, MediaDownloadTask>;
  private flushUpdates: () => void;

  constructor(getMainWindow: () => BrowserWindow | null) {
    this.queue = new PQueue({ concurrency: 3 });
    this.taskMap = new Map();
    this.controllerMap = new Map();
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

  private broadcast({ type, data }: Partial<MediaDownloadBroadcastPayload>) {
    const window = this.getMainWindow();
    if (window) {
      const payload = type === "full" ? { type: "full", data: this.getTaskList() } : { type: "update", data };
      window.webContents.send(channel.download.sync, payload);
    }
  }

  private restoreQueue() {
    const downloads = mediaDownloadsStore.store;
    if (downloads && Object.keys(downloads).length > 0) {
      Object.values(downloads).forEach(task => {
        const core = new DownloadCore(task);
        this.taskMap.set(task.id, core);
      });
      this.broadcast({ type: "full" });
    }
  }

  public addTask(mediaInfo: MediaDownloadInfo) {
    const id = randomUUID();
    const controller = new AbortController();
    const taskData: FullMediaDownloadTask = {
      id,
      outputFileType: mediaInfo.outputFileType,
      title: mediaInfo.title,
      cover: mediaInfo.cover,
      bvid: mediaInfo.bvid,
      cid: mediaInfo.cid,
      sid: mediaInfo.sid,
      createdTime: Date.now(),
      status: "waiting",
      abortSignal: controller.signal,
    };

    const core = new DownloadCore(taskData);
    this.taskMap.set(id, core);
    this.controllerMap.set(id, controller);
    this.queueTask(core);
    this.broadcast({ type: "full" });
  }

  public addTasks(mediaInfos: MediaDownloadInfo[]) {
    mediaInfos.forEach(mediaInfo => this.addTask(mediaInfo));
  }

  // 缺少分集 id，需要获取视频分集信息
  private async getVideoPages(core: DownloadCore) {
    if (core.bvid && !core.cid) {
      const pages = await getVideoPages(core.bvid);
      if (pages.length > 0) {
        if (pages.length === 1) {
          core.cid = pages[0].cid;
        } else {
          await this.cancelTask(core.id);
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
  }

  private queueTask(core: DownloadCore) {
    this.queue.add(
      async () => {
        await this.getVideoPages(core);

        core.removeAllListeners("update");
        core.on("update", (updateData: any) => {
          this.pendingUpdates.set(core.id!, updateData);
          this.flushUpdates();
        });

        await core.start();
      },
      {
        signal: core.abortSignal,
      },
    );
  }

  public pauseTask(id: string) {
    const controller = this.controllerMap.get(id);
    if (controller) {
      controller.abort();
      this.controllerMap.delete(id);
    }
    const core = this.taskMap.get(id);
    if (core) {
      core.pause();
    }
  }

  // 恢复下载任务
  public resumeTask(id: string) {
    const core = this.taskMap.get(id);
    if (core) {
      const newController = new AbortController();
      core.abortSignal = newController.signal;
      this.controllerMap.set(id, newController);

      this.queue.add(
        async () => {
          // 重新绑定监听器，防止丢失或重复
          core.removeAllListeners("update");
          core.on("update", (updateData: any) => {
            this.pendingUpdates.set(core.id!, updateData);
            this.flushUpdates();
          });

          await core.resume();
        },
        {
          signal: core.abortSignal,
        },
      );
    }
  }

  public retryTask(id: string) {
    const controller = this.controllerMap.get(id);
    if (controller) {
      controller.abort();
      this.controllerMap.delete(id);
    }

    const core = this.taskMap.get(id);
    if (core) {
      core.status = "waiting";
      core.error = undefined;
      core.downloadProgress = 0;
      core.mergeProgress = 0;
      core.convertProgress = 0;
      const newController = new AbortController();
      core.abortSignal = newController.signal;
      this.controllerMap.set(id, newController);
      this.queueTask(core);
      this.broadcast({ type: "full" });
    }
  }

  public getTaskList(): MediaDownloadTask[] {
    return Array.from(this.taskMap.values()).map(core => ({
      id: core.id,
      outputFileType: core.outputFileType,
      title: core.title!,
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

  public quitAndSave() {
    this.taskMap.forEach(core => core.removeAllListeners());
    this.pendingUpdates.clear();
    this.controllerMap.forEach(controller => controller.abort());
    this.controllerMap.clear();
    this.saveAllTasksToStore();
  }

  public saveAllTasksToStore() {
    this.controllerMap.forEach(controller => controller.abort());
    this.taskMap.forEach(core => {
      core.removeAllListeners();
      core.chunkQueue?.clear();
    });
    const tasksObject: Record<string, FullMediaDownloadTask> = {};
    this.taskMap.forEach((core, id) => {
      tasksObject[`downloads.${id}`] = {
        id: core.id,
        outputFileType: core.outputFileType,
        title: core.title,
        cover: core.cover,
        createdTime: core.createdTime,
        bvid: core.bvid,
        cid: core.cid,
        sid: core.sid,
        audioUrl: core.audioUrl,
        audioCodecs: core.audioCodecs,
        audioBandwidth: core.audioBandwidth,
        videoUrl: core.videoUrl,
        videoResolution: core.videoResolution,
        videoFrameRate: core.videoFrameRate,
        totalBytes: core.totalBytes,
        audioTotalBytes: core.audioTotalBytes,
        videoTotalBytes: core.videoTotalBytes,
        downloadedBytes: core.downloadedBytes,
        downloadProgress: core.downloadProgress,
        mergeProgress: core.mergeProgress,
        convertProgress: core.convertProgress,
        status:
          core.status === "downloading"
            ? "downloadPaused"
            : core.status === "merging"
              ? "mergePaused"
              : core.status === "converting"
                ? "convertPaused"
                : core.status,
        fileName: core.fileName,
        tempDir: core.tempDir,
        saveDir: core.saveDir,
        savePath: core.savePath,
        audioTempPath: core.audioTempPath,
        videoTempPath: core.videoTempPath,
        chunks: core.chunks,
        error: core.error,
      };
    });
    mediaDownloadsStore.store = tasksObject;
  }

  public async cancelTask(id: string) {
    this.pendingUpdates.delete(id);

    const controller = this.controllerMap.get(id);
    if (controller) {
      controller.abort();
      this.controllerMap.delete(id);
    }

    const core = this.taskMap.get(id);
    if (core) {
      await core.cancel();
      this.taskMap.delete(id);
    }

    this.broadcast({ type: "full" });
  }

  public async clearTasks() {
    this.pendingUpdates.clear();
    this.controllerMap.forEach(controller => controller.abort());
    this.controllerMap.clear();
    await Promise.all(Array.from(this.taskMap.values()).map(core => core.cancel()));
    this.taskMap.clear();
    mediaDownloadsStore.clear();
    this.broadcast({ type: "full" });
  }
}
