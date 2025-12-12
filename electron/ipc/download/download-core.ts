import { app } from "electron";
import log from "electron-log";
import got from "got";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import PQueue from "p-queue";

import type { MediaDownloadChunk, MediaDownloadTaskBase } from "./types";

import { UserAgent } from "../../network/user-agent";
import { appSettingsStore, storeKey } from "../../store";
import { getAudioWebStreamUrl } from "../api/audio-stream-url";
import { getDashurl } from "../api/dash-url";
import { convert } from "./ffmpeg-processor";
import { getStreamAudioBandwidth, sortAudio } from "./utils";

const ChunkSize = 10 * 1024 * 1024; // 10MB
const TempRootDir = path.join(os.tmpdir(), "biu-temp-downloader");

export class DownloadCore extends EventEmitter {
  public id?: string;
  public title?: string;
  public bvid?: string;
  public cid?: string;
  public sid?: string;
  public outputFileType: MediaDownloadOutputFileType;
  public audioUrl?: string;
  public audioCodecs?: string;
  public audioBandwidth?: number;
  public audioTotalBytes: number = 0;
  public videoUrl?: string;
  public videoResolution?: string;
  public videoFrameRate?: string;
  public videoTotalBytes: number = 0;
  public totalBytes?: number;
  public downloadedBytes: number = 0;
  public status?: MediaDownloadStatus;
  public chunks: MediaDownloadChunk[] = [];
  public fileName?: string;
  public savePath: string;
  public tempDir: string = "";
  public audioTempPath: string = "";
  public videoTempPath: string = "";

  private abortSignal: AbortSignal;
  private chunkQueue: PQueue;

  constructor(task: MediaDownloadTaskBase, signal: AbortSignal) {
    super();
    this.id = task.id;
    this.title = task.title;
    this.outputFileType = task.outputFileType;
    this.bvid = task.bvid;
    this.cid = task.cid;
    this.sid = task.sid;
    this.status = task.status;

    this.abortSignal = signal;
    this.fileName = `${this.title}-${this.id}${this.getAudioExt()}`;
    if (this.outputFileType === "video") {
      this.fileName = `${this.title}-${this.id}${this.getVideoExt()}`;
    }
    this.savePath = appSettingsStore.get(storeKey.appSettings).downloadPath || app.getPath("downloads");
    this.tempDir = path.join(TempRootDir, this.id);
    this.audioTempPath = path.join(this.tempDir, "audio.m4s");
    if (this.outputFileType === "video") {
      this.videoTempPath = path.join(this.tempDir, "video.m4s");
    }
    this.chunkQueue = new PQueue({ concurrency: 5 });
  }

  public async start(): Promise<void> {
    try {
      // 获取下载链接
      this.updateStatus("downloading");
      await this.setDownloadUrl();

      // 获取文件大小
      const audioSize = await this.getAudioSize();
      this.audioTotalBytes = audioSize;
      this.totalBytes = audioSize;
      this.splitChunks({ type: "audio", totalSize: audioSize, chunkSize: ChunkSize });
      if (this.outputFileType === "video") {
        const videoSize = await this.getVideoSize();
        this.videoTotalBytes = videoSize;
        this.totalBytes += videoSize;
        this.splitChunks({ type: "video", totalSize: videoSize, chunkSize: ChunkSize });
      }

      this.ensureDir(this.tempDir);

      await this.downloadChunked();

      this.updateStatus("merging");
      await this.mergeChunks("audio", this.audioTempPath);
      if (this.outputFileType === "video") {
        await this.mergeChunks("video", this.videoTempPath);
      }
      this.deleteChunkFiles();

      this.updateStatus("converting");
      const outputPath = path.join(this.savePath, this.fileName!);
      await convert({
        outputFileType: this.outputFileType,
        audioTempPath: this.audioTempPath,
        videoTempPath: this.videoTempPath,
        outputPath,
        onProgress: progress => {
          if (progress.percent) {
            this.updateConversionProgress(progress.percent);
          }
        },
      });
      this.deleteTempFiles();

      this.updateStatus("completed");
    } catch (error: any) {
      log.error(`[${this.id}] Download failed:`, error);
      this.emitError(error);
    }
  }

  private setDownloadUrl = async () => {
    if (this.sid) {
      const streamRes = await getAudioWebStreamUrl(this.sid);

      if (streamRes.data?.cdns?.[0]) {
        const isFlac = streamRes?.data?.type === 3;
        this.audioUrl = streamRes.data?.cdns?.[0];
        this.audioCodecs = isFlac ? "flac" : "aac";
        this.audioBandwidth = getStreamAudioBandwidth(streamRes?.data?.type);
      } else {
        this.emitError(new Error("Audio URL is empty"));
        return;
      }
    } else if (this.bvid && this.cid) {
      const dashData = await getDashurl({
        bvid: this.bvid,
        cid: this.cid,
        fnval: 4048,
      });

      const audioList = sortAudio(dashData?.data?.dash?.audio ?? []);
      const bestVideoInfo = dashData?.data?.dash?.video?.[0];
      const videoUrl = bestVideoInfo?.baseUrl || bestVideoInfo?.backupUrl?.[0];
      const flacAudio = dashData?.data?.dash?.flac?.audio;
      const dolbyAudio = dashData?.data?.dash?.dolby?.audio?.[0];
      this.audioUrl =
        flacAudio?.baseUrl ||
        flacAudio?.backupUrl?.[0] ||
        dolbyAudio?.baseUrl ||
        dolbyAudio?.backupUrl?.[0] ||
        audioList[0]?.baseUrl ||
        audioList[0]?.backupUrl?.[0];
      this.audioCodecs = flacAudio?.codecs || dolbyAudio?.codecs || audioList[0]?.codecs;
      this.audioBandwidth = audioList[0]?.bandwidth;
      if (this.outputFileType === "video") {
        this.videoUrl = videoUrl;
        this.videoResolution = `${bestVideoInfo?.width}x${bestVideoInfo?.height}`;
        this.videoFrameRate = bestVideoInfo?.frameRate || bestVideoInfo?.frame_rate;
      }
    }
  };

  private ensureDir = (dir: string) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  };

  public cancel(): void {
    this.chunkQueue.clear();
    this.chunks = [];
    this.deleteChunkFiles();
    this.deleteTempFiles();
  }

  public pause(): void {
    this.updateStatus("paused");
  }

  public async resume(): Promise<void> {
    await this.start();
  }

  private deleteChunkFiles = () => {
    this.chunks.forEach(chunk => {
      fs.unlinkSync(path.join(this.tempDir, chunk.name));
    });
  };

  private deleteTempFiles = () => {
    try {
      if (this.tempDir && fs.existsSync(this.tempDir)) {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      log.error(`[${this.id}] Failed to clean up temp files:`, error);
    }
  };

  private getAudioSize = async () => {
    try {
      const response = await got.head(this.audioUrl as string, {
        headers: this.getHeaders(),
        timeout: { request: 10000 },
        retry: { limit: 3 },
        signal: this.abortSignal,
      });
      const len = response.headers["content-length"];
      return len ? parseInt(len, 10) : 0;
    } catch {
      log.warn(`[${this.title}] Failed to get content length, defaulting to 0`);
      return 0;
    }
  };

  private getVideoSize = async () => {
    const response = await got.head(this.videoUrl as string, {
      headers: this.getHeaders(),
      timeout: { request: 10000 },
      retry: { limit: 3 },
      signal: this.abortSignal,
    });
    const len = response.headers["content-length"];
    return len ? parseInt(len, 10) : 0;
  };

  private getHeaders = () => {
    return {
      Origin: "https://www.bilibili.com",
      Referer: "https://www.bilibili.com",
      "User-Agent": UserAgent,
    };
  };

  /**
   * 根据音频编码选择合适的文件扩展名
   * @returns 对应的文件扩展名，如 '.m4a' 或 '.mp3'
   */
  private getAudioExt = () => {
    if (this.audioCodecs?.includes("flac")) {
      return ".flac"; // Opus 编码 -> opus 后缀
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
    const chunksCount = Math.ceil(totalSize / chunkSize);

    for (let i = 0; i < chunksCount; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize - 1, totalSize - 1);
      this.chunks.push({
        type,
        start,
        end,
        name: `${type}.part${i + 1}`,
        done: false,
      });
    }
  };

  private async downloadChunked(): Promise<void> {
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
      signal: this.abortSignal,
      retry: { limit: 3 },
    });

    stream.on("data", chunk => {
      this.downloadedBytes += chunk.length;
      this.updateDownloadProgress();
    });

    await pipeline(stream, fs.createWriteStream(destPath), {
      signal: this.abortSignal,
    });

    const chunkIndex = this.chunks.findIndex(c => c.type === type && c.start === start && c.end === end);
    if (chunkIndex > -1) {
      this.chunks[chunkIndex].done = true;
    }
  }

  private async mergeChunks(type: MediaDownloadOutputFileType, destPath: string): Promise<void> {
    const chunks = this.chunks.filter(chunk => chunk.type === type);
    const writeStream = fs.createWriteStream(destPath, {
      signal: this.abortSignal,
    });

    const totalSize = chunks.reduce((acc, chunk) => acc + (chunk.end - chunk.start + 1), 0);
    let mergedBytes = 0;

    for (const chunk of chunks) {
      const chunkPath = path.join(this.tempDir, chunk.name);
      await new Promise<void>((resolve, reject) => {
        const readStream = fs.createReadStream(chunkPath);
        readStream.on("error", err => {
          writeStream.destroy(err);
          reject(err);
        });
        readStream.on("data", bf => {
          mergedBytes += bf.length;
          this.updateMergeProgress((mergedBytes / totalSize) * 100);
        });
        readStream.pipe(writeStream, { end: false });
        readStream.on("end", resolve);
      });
    }

    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
  }

  private updateStatus = (status: MediaDownloadStatus) => {
    this.status = status;
    this.emit("statusChange", {
      id: this.id,
      status,
      timestamp: Date.now(),
    });
  };

  private updateDownloadProgress = () => {
    const percent =
      (this.totalBytes ?? 0) > 0 ? Number(((this.downloadedBytes / this.totalBytes!) * 100).toFixed(2)) : 0;
    this.emit("downloadProgress", {
      id: this.id,
      progress: percent,
      timestamp: Date.now(),
    });
  };

  private updateMergeProgress = (percent: number) => {
    this.emit("mergeProgress", {
      id: this.id,
      progress: percent,
      timestamp: Date.now(),
    });
  };

  private updateConversionProgress = (percent: number) => {
    this.emit("convertProgress", {
      id: this.id,
      progress: percent,
      timestamp: Date.now(),
    });
  };

  private emitError = (error: Error) => {
    this.updateStatus("failed");
    this.emit("error", {
      id: this.id,
      error: error.message,
      timestamp: Date.now(),
    });
  };
}
