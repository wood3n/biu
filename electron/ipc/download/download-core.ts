import { app, BrowserWindow, ipcMain } from "electron";
import log from "electron-log";
import got from "got";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import PQueue from "p-queue";

import type { MediaDownloadChunk } from "./types";

import { UserAgent } from "../../network/user-agent";
import { store, storeKey } from "../../store";
import { channel } from "../channel";
import { convert } from "./ffmpeg-processor";

const ChunkSize = 10 * 1024 * 1024; // 10MB
const TempRootDir = path.join(os.tmpdir(), "biu-temp-downloader");

export class DownloadCore extends EventEmitter {
  public id?: string;
  public title?: string;
  public bvid?: string;
  public cid?: string;
  public sid?: string;
  public outputFileType?: MediaDownloadOutputFileType;
  public audioUrl?: string;
  public videoUrl?: string;
  public audioCodecs?: string;
  public audioTotalBytes: number = 0;
  public videoTotalBytes: number = 0;
  public totalBytes?: number;
  public status?: MediaDownloadStatus;

  public fileName?: string;
  private tempDir: string;
  private audioTempPath: string;
  private videoTempPath: string;
  private abortController: AbortController;
  private chunkQueue: PQueue;
  private chunks: MediaDownloadChunk[] = [];
  private downloadedBytes: number = 0;

  private savePath: string = store.get(storeKey.appSettings).downloadPath || app.getPath("downloads");

  constructor(task: MediaDownloadTask) {
    super();
    this.id = task.id;
    this.title = task.title;
    this.outputFileType = task.outputFileType;
    this.audioUrl = task.audioUrl;
    this.videoUrl = task.videoUrl;
    this.audioCodecs = task.audioCodecs;
    this.status = task.status;
  }

  private getUrlFromRenderer = async () => {
    return new Promise<MediaDownloadUrlData>((resolve, reject) => {
      // A. 设置超时 (防止 React 卡死导致队列堵塞)
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("获取下载链接超时"));
      }, 10000); // 30秒超时

      // B. 定义一次性监听器，接收 React 的回信
      // 使用 taskId 作为唯一标识，防止消息串台
      const cbChannel = `reply-link-${this.id}`;

      const listener = (_, response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.data as MediaDownloadUrlData); // 返回 { videoUrl, audioUrl }
        }
        cleanup();
      };

      // C. 清理函数
      const cleanup = () => {
        clearTimeout(timeout);
        ipcMain.removeListener(cbChannel, listener);
      };

      // D. 注册监听
      ipcMain.once(cbChannel, listener);

      // E. 发送请求给 React
      BrowserWindow.getAllWindows().forEach(w =>
        w.webContents.send(channel.download.getDownloadData, { bvid: this.bvid, cid: this.cid, sid: this.sid }),
      );
    });
  };

  private ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  };

  public async start(): Promise<void> {
    try {
      // 获取下载链接
      const downloadUrlData = await this.getUrlFromRenderer();
      this.audioUrl = downloadUrlData.audioUrl;
      this.videoUrl = downloadUrlData.videoUrl;
      this.audioCodecs = downloadUrlData.audioCodecs;

      // 获取文件大小
      const audioSize = await this.getAudioSize();
      this.audioTotalBytes = audioSize;
      this.totalBytes = audioSize;
      this.chunks.push(...this.splitChunks({ type: "audio", totalSize: audioSize, chunkSize: ChunkSize }));
      if (this.outputFileType === "video") {
        const videoSize = await this.getVideoSize();
        this.videoTotalBytes = videoSize;
        this.totalBytes += videoSize;
        this.chunks.push(...this.splitChunks({ type: "video", totalSize: videoSize, chunkSize: ChunkSize }));
      }

      this.tempDir = path.join(TempRootDir, this.id!);
      this.ensureDir(this.tempDir);
      this.abortController = new AbortController();

      await this.downloadChunked();
      this.audioTempPath = path.join(this.tempDir, "audio.m4s");
      await this.mergeChunks("audio", this.audioTempPath);
      if (this.outputFileType === "video") {
        this.videoTempPath = path.join(this.tempDir, "video.m4s");
        await this.mergeChunks("video", this.videoTempPath);
      }

      this.deleteChunkFiles();

      // 3. Conversion if needed
      this.fileName = `${this.title}-${this.id}${this.getAudioExt()}`;
      if (this.outputFileType === "video") {
        this.fileName = `${this.title}-${this.id}${this.getVideoExt()}`;
      }

      const outputPath = path.join(this.savePath, this.fileName!);
      await convert({
        outputFileType: this.outputFileType!,
        audioTempPath: this.audioTempPath,
        videoTempPath: this.videoTempPath,
        outputPath,
        onProgress: progress => { },
      });

      this.deleteTempFiles();
    } catch (error: any) { }
  }

  public cancel(): void {
    this.abortController.abort();
    this.updateStatus(DownloadStatus.CANCELLED);
    // Cleanup temp files
    this.cleanup();
  }

  public pause(): void {
    this.abortController.abort();
    this.updateStatus(DownloadStatus.PAUSED);
  }

  public async resume(): Promise<void> {
    // Reset abort controller
    this.abortController = new AbortController();
    await this.start();
  }

  private deleteChunkFiles = () => {
    this.chunks.forEach(chunk => {
      fs.unlinkSync(path.join(this.tempDir, chunk.name));
    });
  };

  private deleteTempFiles = () => {
    fs.unlinkSync(this.audioTempPath);
    if (this.outputFileType === "video") {
      fs.unlinkSync(this.videoTempPath);
    }
  };

  private getAudioSize = async () => {
    try {
      const response = await got.head(this.audioUrl as string, {
        headers: this.getHeaders(),
        timeout: { request: 10000 },
        retry: { limit: 3 },
      });
      const len = response.headers["content-length"];
      return len ? parseInt(len, 10) : 0;
    } catch {
      log.warn(`[${this.title}] Failed to get content length, defaulting to 0`);
      return 0;
    }
  };

  private getVideoSize = async () => {
    try {
      const response = await got.head(this.videoUrl as string, {
        headers: this.getHeaders(),
        timeout: { request: 10000 },
        retry: { limit: 3 },
      });
      const len = response.headers["content-length"];
      return len ? parseInt(len, 10) : 0;
    } catch {
      log.warn(`[${this.title}] Failed to get content length, defaulting to 0`);
      return 0;
    }
  };

  private getHeaders = () => {
    return {
      Referer: "https://www.bilibili.com",
      "User-Agent": UserAgent,
    };
  };

  /**
   * 根据音频编码选择合适的文件扩展名
   * @returns 对应的文件扩展名，如 '.m4a' 或 '.mp3'
   */
  private getAudioExt = () => {
    // 检查编码字符串
    if (this.audioCodecs?.startsWith("mp4a") || this.audioCodecs?.includes("aac")) {
      return ".m4a"; // AAC 编码 -> m4a 后缀
    }
    if (this.audioCodecs?.startsWith("ec-3") || this.audioCodecs?.startsWith("ac-3")) {
      return ".m4a"; // 杜比编码 -> 也可以封装进 m4a (或用 .eac3)
    }
    if (this.audioCodecs?.includes("mp3")) {
      return ".mp3"; // 只有源文件本身就是 mp3 编码时，才用 .mp3
    }
    return ".m4a"; // 默认兜底
  };

  private getVideoExt = () => {
    // 无损音频输出视频格式
    if (this.audioCodecs?.includes("flac")) {
      return ".mkv"; // H.264 编码 -> mp4 后缀
    }
    return ".mp4"; // 默认兜底
  };

  private splitChunks = ({
    type,
    totalSize,
    chunkSize,
  }: {
    type: MediaDownloadOutputFileType;
    totalSize: number;
    chunkSize: number;
  }) => {
    const chunks: MediaDownloadChunk[] = [];
    const chunksCount = Math.ceil(totalSize / chunkSize);

    for (let i = 0; i < chunksCount; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize - 1, totalSize - 1);
      chunks.push({
        type,
        index: i,
        start,
        end,
        name: `${type}.part${i + 1}`,
        done: false,
      });
    }

    return chunks;
  };

  private async downloadChunked(): Promise<void> {
    this.ensureDir(this.tempDir);
    this.chunkQueue = new PQueue({ concurrency: 5 });

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      const chunkPath = path.join(this.tempDir, chunk.name);

      // Check if chunk exists and is complete
      if (fs.existsSync(chunkPath)) {
        const stat = fs.statSync(chunkPath);
        if (stat.size === chunk.end - chunk.start + 1) {
          this.downloadedBytes += stat.size;
          continue; // Skip existing
        }
      }

      this.chunkQueue.add(async () => {
        await this.downloadChunk({
          type: chunk.type,
          start: chunk.start,
          end: chunk.end,
          destPath: chunkPath,
        });
      });
    }
  }

  private async downloadChunk({
    type,
    start,
    end,
    destPath,
  }: {
    type: MediaDownloadOutputFileType;
    start: number;
    end: number;
    destPath: string;
  }): Promise<void> {
    const stream = got.stream(type === "audio" ? this.audioUrl : this.videoUrl, {
      headers: {
        ...this.getHeaders(),
        Range: `bytes=${start}-${end}`,
      },
      signal: this.abortController.signal,
      retry: { limit: 3 },
    });

    stream.on("data", chunk => {
      this.downloadedBytes += chunk.length;
    });

    const fileStream = fs.createWriteStream(destPath);
    await pipeline(stream, fileStream);
  }

  private async mergeChunks(type: MediaDownloadOutputFileType, destPath: string): Promise<void> {
    const chunks = this.chunks.filter(chunk => chunk.type === type);
    const writeStream = fs.createWriteStream(destPath);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkPath = path.join(this.tempDir, chunk.name);
      const data = await fs.promises.readFile(chunkPath);
      writeStream.write(data);
    }

    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
  }

  private updateStatus(status: DownloadStatus) {
    this.task.status = status;
    this.task.updatedTime = Date.now();
    this.emit("status", this.task);
  }

  private updateDownloadProgress = () => {
    const percent =
      (this.totalBytes ?? 0) > 0 ? Number(((this.downloadedBytes / this.totalBytes!) * 100).toFixed(2)) : 0;
    this.emit("progress", { percent });
  };

  private updateMergeProgress = (percent: number) => {
    this.emit("progress", { percent });
  };

  private updateConversionProgress = (percent: number) => {
    this.emit("progress", { percent });
  };
}
