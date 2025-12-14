import { app } from "electron";
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
import { appSettingsStore, storeKey } from "../../store";
import { getAudioWebStreamUrl } from "../api/audio-stream-url";
import { getDashurl } from "../api/dash-url";
import { convert } from "./ffmpeg-processor";
import { ensureDir, getStreamAudioBandwidth, removeDirOrFile, sortAudio } from "./utils";

const SplitChunkLimitSize = 10 * 1024 * 1024; // 10MB
const ChunkSize = 10 * 1024 * 1024; // 10MB
const TempRootDir = path.join(os.tmpdir(), "biu-temp-downloader");

export class DownloadCore extends EventEmitter {
  public id: string;
  public title: string;
  public cover?: string;
  public createdTime: number;
  public bvid?: string;
  public cid?: string | number;
  public sid?: string | number;
  public outputFileType: MediaDownloadOutputFileType;
  public audioUrl?: string;
  public audioCodecs?: string;
  public audioBandwidth?: number;
  public audioTotalBytes: number = 0;
  public videoUrl?: string;
  public videoResolution?: string;
  public videoFrameRate?: string;
  public videoTotalBytes: number = 0;
  public totalBytes?: number = 0;
  public downloadedBytes: number = 0;
  public downloadProgress: number = 0;
  public mergeProgress: number = 0;
  public convertProgress: number = 0;
  public status: MediaDownloadStatus;
  public fileName?: string;
  public savePath: string = "";
  public tempDir: string = "";
  public audioTempPath: string = "";
  public videoTempPath: string = "";
  public chunks: MediaDownloadChunk[] = [];
  public error?: string;

  private abortSignal: AbortSignal;
  private chunkQueue?: PQueue;

  constructor(task: MediaDownloadTaskBase, signal: AbortSignal) {
    super();
    this.id = task.id;
    this.title = task.title;
    this.cover = task.cover;
    this.createdTime = task.createdTime;
    this.outputFileType = task.outputFileType;
    this.bvid = task.bvid;
    this.cid = task.cid;
    this.sid = task.sid;
    this.status = task.status;
    this.abortSignal = signal;

    this.savePath = appSettingsStore.get(storeKey.appSettings).downloadPath || app.getPath("downloads");
    this.tempDir = path.join(TempRootDir, this.id);
    this.audioTempPath = path.join(this.tempDir, "audio.m4s");
    if (this.outputFileType === "video") {
      this.videoTempPath = path.join(this.tempDir, "video.m4s");
    }
  }

  public async start(): Promise<void> {
    try {
      // 获取下载链接
      this.status = "downloading";
      this.emitUpdate();
      this.chunkQueue = new PQueue({ concurrency: 5 });
      await this.setDownloadUrl();

      if (this.audioUrl === undefined) {
        this.status = "failed";
        this.error = "无法获取音频下载链接";
        this.emitUpdate();
        return;
      }

      // 设置文件名
      const sanitizedTitle = this.title.replace(/<[^>]+>/g, "").replace(/[\\/:*?"<>|]/g, "_");
      this.fileName = `${sanitizedTitle}-${this.id}${this.getAudioExt()}`;
      if (this.outputFileType === "video") {
        this.fileName = `${sanitizedTitle}-${this.id}${this.getVideoExt()}`;
      }

      // 获取文件大小
      const audioSize = await this.getContentLength(this.audioUrl!);
      if (audioSize === 0) {
        this.status = "failed";
        this.error = "无法获取音频文件大小";
        this.emitUpdate();
        return;
      }
      this.audioTotalBytes = audioSize;
      this.totalBytes = audioSize;

      const isAudioSplit = this.audioTotalBytes > SplitChunkLimitSize;
      if (isAudioSplit) {
        this.splitChunks({ type: "audio", totalSize: audioSize, chunkSize: ChunkSize });
      }

      let isVideoSplit = false;
      if (this.outputFileType === "video") {
        const videoSize = await this.getContentLength(this.videoUrl!);
        if (videoSize === 0) {
          this.status = "failed";
          this.error = "无法获取视频文件大小";
          this.emitUpdate();
          return;
        }
        this.videoTotalBytes = videoSize;
        this.totalBytes += videoSize;
        isVideoSplit = this.videoTotalBytes > SplitChunkLimitSize;
        if (isVideoSplit) {
          this.splitChunks({ type: "video", totalSize: videoSize, chunkSize: ChunkSize });
        }
      }

      ensureDir(this.tempDir);

      const downloadPromises: Promise<void>[] = [];

      if (this.chunks.length > 0) {
        await this.downloadChunks();
        if (this.chunkQueue) {
          downloadPromises.push(this.chunkQueue.onIdle());
        }
      }

      if (!isAudioSplit) {
        downloadPromises.push(
          this.processDownload({
            type: "audio",
            destPath: this.audioTempPath,
          }),
        );
      }

      if (this.outputFileType === "video" && !isVideoSplit) {
        downloadPromises.push(
          this.processDownload({
            type: "video",
            destPath: this.videoTempPath,
          }),
        );
      }

      await Promise.all(downloadPromises);

      this.status = "merging";
      this.emitUpdate();

      if (isAudioSplit) {
        await this.mergeChunks("audio", this.audioTempPath);
      }
      if (this.outputFileType === "video" && isVideoSplit) {
        await this.mergeChunks("video", this.videoTempPath);
      }
      this.deleteChunkFiles();
      this.chunks = [];

      this.status = "converting";
      this.emitUpdate();
      const outputPath = path.join(this.savePath, this.fileName!);
      await convert({
        outputFileType: this.outputFileType,
        audioTempPath: this.audioTempPath,
        videoTempPath: this.videoTempPath,
        outputPath,
        onProgress: percent => {
          if (percent) {
            this.convertProgress = percent;
            this.emitUpdate();
          }
        },
      });
      this.deleteTempFiles();

      this.status = "completed";
      this.emitUpdate();
    } catch (error) {
      this.status = "failed";
      this.error = error instanceof Error ? error.message : String(error);
      this.logError(error);
      this.emitUpdate();
    }
  }

  private async setDownloadUrl() {
    if (this.sid) {
      const streamRes = await getAudioWebStreamUrl(this.sid);

      if (streamRes.data?.cdns?.[0]) {
        const isFlac = streamRes?.data?.type === 3;
        this.audioUrl = streamRes.data?.cdns?.[0];
        this.audioCodecs = isFlac ? "flac" : "aac";
        this.audioBandwidth = getStreamAudioBandwidth(streamRes?.data?.type);
      } else {
        this.status = "failed";
        this.error = "无法获取音乐链接";
        this.emitUpdate();
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
      if (!this.audioUrl) {
        this.status = "failed";
        this.error = "无法获取音频链接";
        this.emitUpdate();
        return;
      }
      this.audioCodecs = flacAudio?.codecs || dolbyAudio?.codecs || audioList[0]?.codecs;
      this.audioBandwidth = flacAudio?.bandwidth || dolbyAudio?.bandwidth || audioList[0]?.bandwidth;
      if (this.outputFileType === "video") {
        this.videoUrl = videoUrl;
        this.videoResolution = `${bestVideoInfo?.width}x${bestVideoInfo?.height}`;
        this.videoFrameRate = bestVideoInfo?.frameRate || bestVideoInfo?.frame_rate;
      }
    }
  }

  public cancel(): void {
    this.removeAllListeners();
    this.chunkQueue?.clear();
    this.chunks = [];
    this.deleteChunkFiles();
    this.deleteTempFiles();
  }

  public pause(): void {
    this.status = "paused";
    this.emitUpdate();
  }

  public async resume(): Promise<void> {
    await this.start();
  }

  private deleteChunkFiles() {
    this.chunks.forEach(chunk => {
      removeDirOrFile(path.join(this.tempDir, chunk.name));
    });
  }

  private deleteTempFiles() {
    removeDirOrFile(this.tempDir);
  }

  private async getContentLength(url: string) {
    const options = {
      headers: this.getHeaders(),
      timeout: { request: 10000 },
      retry: { limit: 3 },
      signal: this.abortSignal,
    };

    try {
      const response = await got.head(url, options);
      const len = response.headers["content-length"];
      return len ? parseInt(len, 10) : 0;
    } catch {
      return await new Promise<number>(resolve => {
        const stream = got.stream(url, {
          ...options,
          method: "GET",
        });

        stream.on("response", response => {
          const len = response.headers["content-length"];
          stream.destroy();
          resolve(len ? parseInt(len, 10) : 0);
        });

        stream.on("error", err => {
          log.warn(`[${this.title}] GET request failed for content length. Error: ${err.message}`);
          resolve(0);
        });
      });
    }
  }

  private getHeaders() {
    return {
      Origin: "https://www.bilibili.com",
      Referer: "https://www.bilibili.com",
      "User-Agent": UserAgent,
    };
  }

  /**
   * 根据音频编码选择合适的文件扩展名
   * @returns 对应的文件扩展名，如 '.m4a' 或 '.mp3'
   */
  private getAudioExt() {
    if (this.audioCodecs?.toLowerCase().includes("flac")) {
      return ".flac"; // Opus 编码 -> opus 后缀
    }
    if (this.audioCodecs?.toLowerCase().includes("mp3")) {
      return ".mp3"; // 只有源文件本身就是 mp3 编码时，才用 .mp3
    }
    return ".m4a"; // 默认兜底
  }

  private getVideoExt() {
    // 无损音频输出视频格式
    if (this.audioCodecs?.toLowerCase().includes("flac")) {
      return ".mkv"; // H.264 编码 -> mp4 后缀
    }
    return ".mp4"; // 默认兜底
  }

  private splitChunks({
    type,
    totalSize,
    chunkSize,
  }: {
    type: MediaDownloadOutputFileType;
    totalSize: number;
    chunkSize: number;
  }) {
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
  }

  private async processDownload({
    type,
    destPath,
    range,
  }: {
    type: MediaDownloadOutputFileType;
    destPath: string;
    range?: { start: number; end: number };
  }): Promise<void> {
    const url = type === "audio" ? this.audioUrl : this.videoUrl;
    if (!url) throw new Error(`${type} url is missing`);

    const headers: Record<string, string> = { ...this.getHeaders() };
    if (range) {
      headers.Range = `bytes=${range.start}-${range.end}`;
    }

    const stream = got.stream(url, {
      method: "GET",
      headers,
      signal: this.abortSignal,
      retry: { limit: 3 },
    });

    stream.on("data", bf => {
      this.downloadedBytes += bf.length;
      this.downloadProgress = this.totalBytes ? Math.round((this.downloadedBytes / this.totalBytes) * 100) : 0;
      this.emitUpdate();
    });

    stream.on("error", err => {
      this.status = "failed";
      this.error = err instanceof Error ? err.message : String(err);
      this.logError(err);
      this.emitUpdate();
    });

    await pipeline(stream, fs.createWriteStream(destPath), {
      signal: this.abortSignal,
    });
  }

  private async downloadChunks(): Promise<void> {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      const chunkPath = path.join(this.tempDir, chunk.name);

      // Check if chunk exists and is complete
      if (fs.existsSync(chunkPath)) {
        const stat = fs.statSync(chunkPath);
        if (stat.size === chunk.end - chunk.start + 1) {
          this.downloadedBytes += stat.size;
          this.downloadProgress = this.totalBytes ? Math.round((this.downloadedBytes / this.totalBytes) * 100) : 0;
          this.emitUpdate();
          continue; // Skip existing
        }
      }

      this.chunkQueue?.add(async () => {
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
    await this.processDownload({ type, destPath, range: { start, end } });

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
          this.mergeProgress = Math.round((mergedBytes / totalSize) * 100);
          this.emitUpdate();
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

  private emitUpdate() {
    this.emit("update", {
      id: this.id,
      status: this.status,
      audioCodecs: this.audioCodecs,
      audioBandwidth: this.audioBandwidth,
      videoResolution: this.videoResolution,
      videoFrameRate: this.videoFrameRate,
      totalBytes: this.totalBytes,
      downloadedBytes: this.downloadedBytes,
      downloadProgress: this.downloadProgress,
      mergeProgress: this.mergeProgress,
      convertProgress: this.convertProgress,
      error: this.error,
    });
  }

  private logError(error: unknown) {
    log.error(
      "DownloadCore.start error:",
      {
        title: this.title,
        bvid: this.bvid,
        cid: this.cid,
        sid: this.sid,
        fileName: this.fileName,
        savePath: this.savePath,
        totalBytes: this.totalBytes,
        downloadedBytes: this.downloadedBytes,
        downloadProgress: this.downloadProgress,
        chunks: this.chunks,
      },
      error,
    );
  }

  public toTask(): MediaDownloadTask {
    return {
      id: this.id!,
      title: this.title!,
      cover: this.cover,
      createdTime: this.createdTime!,
      outputFileType: this.outputFileType,
      bvid: this.bvid,
      cid: this.cid,
      sid: this.sid,
      status: this.status!,
      downloadProgress: this.downloadProgress,
      mergeProgress: this.mergeProgress,
      convertProgress: this.convertProgress,
    };
  }
}
