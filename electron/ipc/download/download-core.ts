import { app } from "electron";
import got from "got";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import PQueue from "p-queue";

import type { FullMediaDownloadTask, MediaDownloadChunk } from "./types";

import { UserAgent } from "../../network/user-agent";
import { appSettingsStore } from "../../store";
import { sanitizeFilename } from "../../utils";
import { getAudioWebStreamUrl } from "../api/audio-stream-url";
import { getDashurl } from "../api/dash-url";
import { convert } from "./ffmpeg-processor";
import { ensureDir, getStreamAudioBandwidth, isUrlValid, removeDirOrFile, sortAudio } from "./utils";

const ChunkSize = 10 * 1024 * 1024; // 10MB
const TempRootDir = path.join(os.tmpdir(), "biu-temp-downloader");

export class DownloadCore extends EventEmitter {
  public id: string;
  public title!: string;
  public cover?: string;
  public createdTime?: number;
  public bvid?: string;
  public cid?: string | number;
  public sid?: string | number;
  public outputFileType: MediaDownloadOutputFileType = "audio";
  public audioUrl?: string;
  public audioCodecs?: string;
  public audioBandwidth?: number;
  public audioTotalBytes: number = 0;
  public videoUrl?: string;
  public videoResolution?: string;
  public videoFrameRate?: string;
  public videoTotalBytes: number = 0;
  public totalBytes: number = 0;
  public downloadedBytes: number = 0;
  private mergedBytes: number = 0;
  public downloadProgress: number = 0;
  public mergeProgress: number = 0;
  public convertProgress: number = 0;
  public status: MediaDownloadStatus = "waiting";
  public fileName?: string;
  public saveDir: string;
  public tempDir: string = TempRootDir;
  public savePath?: string;
  public audioTempPath?: string;
  public videoTempPath?: string;
  public chunks: MediaDownloadChunk[] = [];
  public error?: string;
  public abortSignal?: AbortSignal;
  public chunkQueue?: PQueue;

  constructor(task: FullMediaDownloadTask) {
    super();
    this.id = task.id;
    this.saveDir = appSettingsStore.get("appSettings.downloadPath") || app.getPath("downloads");
    Object.assign(this, task);
    if (!this.title.trim()) {
      this.title = `biu下载-${this.id}`;
    }
  }

  public async start(): Promise<void> {
    try {
      // 获取下载链接
      this.status = "downloading";
      this.emitUpdate();
      if (
        (this.outputFileType === "audio" && !isUrlValid(this.audioUrl)) ||
        (this.outputFileType === "video" &&
          (!isUrlValid(this.videoUrl) || (Boolean(this.audioCodecs) && !isUrlValid(this.audioUrl))))
      ) {
        await this.setDownloadUrl();
      }

      // 获取文件大小
      await this.setDownloadBytes();

      // 清空旧的分块信息，防止断点续传时重复添加
      this.chunks = [];
      if (this.audioTotalBytes > 0) {
        this.splitChunks({ type: "audio", totalSize: this.audioTotalBytes, chunkSize: ChunkSize });
      }
      if (this.outputFileType === "video") {
        this.splitChunks({ type: "video", totalSize: this.videoTotalBytes, chunkSize: ChunkSize });
      }

      // 设置临时文件夹
      this.tempDir = path.join(TempRootDir, this.id);
      if (this.audioTotalBytes > 0) {
        this.audioTempPath = path.join(this.tempDir, "audio.m4s");
      }
      if (this.outputFileType === "video") {
        this.videoTempPath = path.join(this.tempDir, "video.m4s");
      }
      await ensureDir(this.tempDir);

      // 下载分块
      await this.downloadChunks();

      // @ts-ignore 因为pause这里的status会被设置为暂停
      if (this.status === "downloadPaused" || this.abortSignal?.aborted) {
        return;
      }

      // 合并分块
      await this.mergeChunks();

      // @ts-ignore 因为pause这里的status会被设置为暂停
      if (this.status === "mergePaused" || this.abortSignal?.aborted) {
        return;
      }

      // ffmepg 转换
      await this.convertTempFileByFFmpeg();

      this.status = "completed";
      this.emitUpdate();
    } catch (error) {
      if (
        this.status === "downloadPaused" ||
        this.status === "mergePaused" ||
        this.status === "convertPaused" ||
        this.abortSignal?.aborted
      ) {
        return;
      }
      this.status = "failed";
      this.error = error instanceof Error ? error.message : String(error);
      this.emitUpdate();
    }
  }

  public pause(): void {
    switch (this.status) {
      case "downloading":
        this.status = "downloadPaused";
        this.chunkQueue?.clear();
        break;
      case "merging":
        this.status = "mergePaused";
        break;
      case "converting":
        this.status = "convertPaused";
        break;
      default:
        break;
    }
    this.emitUpdate();
  }

  public async resume() {
    try {
      switch (this.status) {
        case "downloadPaused":
          await this.start();
          break;
        case "mergePaused": {
          await this.mergeChunks();
          if (this.status === "mergePaused" || this.abortSignal?.aborted) return;
          await this.convertTempFileByFFmpeg();
          if (this.status === "convertPaused" || this.abortSignal?.aborted) return;
          this.status = "completed";
          this.emitUpdate();
          break;
        }
        case "convertPaused": {
          await this.convertTempFileByFFmpeg();
          if (this.status === "convertPaused" || this.abortSignal?.aborted) return;
          this.status = "completed";
          this.emitUpdate();
          break;
        }
        default:
          break;
      }
    } catch (error) {
      this.status = "failed";
      this.error = error instanceof Error ? error.message : String(error);
      this.emitUpdate();
    }
  }

  public async cancel(): Promise<void> {
    this.removeAllListeners();
    this.chunkQueue?.clear();
    this.chunks = [];
    await this.deleteChunkFiles();
    await this.deleteTempFiles();
  }

  private async setDownloadUrl() {
    if (this.sid) {
      const getStreamUrlRes = await getAudioWebStreamUrl(this.sid);

      if (getStreamUrlRes.data?.cdns?.[0]) {
        const isFlac = getStreamUrlRes?.data?.type === 3;
        this.audioUrl = getStreamUrlRes.data?.cdns?.[0];
        this.audioCodecs = isFlac ? "flac" : "aac";
        this.audioBandwidth = getStreamAudioBandwidth(getStreamUrlRes?.data?.type);
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
      this.audioBandwidth = flacAudio?.bandwidth || dolbyAudio?.bandwidth || audioList[0]?.bandwidth;
      if (this.outputFileType === "video") {
        this.videoUrl = videoUrl;
        this.videoResolution = `${bestVideoInfo?.width}*${bestVideoInfo?.height}`;
        const frameRate = bestVideoInfo?.frameRate || bestVideoInfo?.frame_rate;
        this.videoFrameRate = frameRate ? String(Math.floor(Number(frameRate))) : "";
      }
    }

    // 有些视频可能没有音频流
    if (this.outputFileType === "audio" && !this.audioUrl) {
      throw new Error("can't get audio url");
    }

    if (this.outputFileType === "video" && !this.videoUrl) {
      throw new Error("can't get video url");
    }
  }

  private async setDownloadBytes() {
    this.totalBytes = 0;
    if (this.audioUrl) {
      const audioSize = await this.getContentLength(this.audioUrl!);
      if (!audioSize) {
        throw new Error("can't get audio file size");
      }
      this.audioTotalBytes = audioSize;
      this.totalBytes += audioSize;
    }

    if (this.outputFileType === "video") {
      const videoSize = await this.getContentLength(this.videoUrl!);
      if (!videoSize) {
        throw new Error("can't get video file size");
      }
      this.videoTotalBytes = videoSize;
      this.totalBytes += videoSize;
    }
  }

  private async convertTempFileByFFmpeg() {
    if (this.outputFileType === "video" && (!this.videoTempPath || !fs.existsSync(this.videoTempPath))) {
      throw new Error("can't get video temp path");
    }

    this.status = "converting";
    this.emitUpdate();
    const sanitizedTitle = sanitizeFilename(this.title);
    this.fileName = `${sanitizedTitle}${this.getAudioExt()}`;
    if (this.outputFileType === "video") {
      this.fileName = `${sanitizedTitle}${this.getVideoExt()}`;
    }
    await ensureDir(this.saveDir);
    this.savePath = path.join(this.saveDir, this.fileName);
    const finalSavePath = await convert({
      outputFileType: this.outputFileType!,
      audioTempPath: this.audioTempPath,
      videoTempPath: this.videoTempPath,
      outputPath: this.savePath,
      onProgress: (percent: number) => {
        this.convertProgress = percent;
        this.emitUpdate();
      },
      signal: this.abortSignal,
    });
    this.savePath = finalSavePath;
    this.fileName = path.basename(finalSavePath);
    this.emitUpdate();
    await this.deleteTempFiles();
  }

  private async deleteChunkFiles() {
    await Promise.all(this.chunks.map(chunk => removeDirOrFile(path.join(this.tempDir!, chunk.name))));
  }

  private async deleteTempFiles() {
    await removeDirOrFile(this.tempDir!);
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
          signal: this.abortSignal,
        });

        stream.on("response", response => {
          const len = response.headers["content-length"];
          stream.destroy();
          resolve(len ? parseInt(len, 10) : 0);
        });

        stream.on("error", () => {
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
   */
  private getAudioExt() {
    if (this.audioCodecs?.toLowerCase().includes("flac")) {
      return ".flac";
    }
    if (this.audioCodecs?.toLowerCase().includes("mp3")) {
      return ".mp3";
    }
    return ".m4a";
  }

  private getVideoExt() {
    // 无损音频输出视频格式
    if (this.audioCodecs?.toLowerCase().includes("flac")) {
      return ".mkv";
    }
    return ".mp4";
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
        name: `${type}.part${i + 1}`,
        start,
        end,
        done: false,
      });
    }
  }

  private async processDownload({
    type,
    destPath,
    range,
    offset = 0,
  }: {
    type: MediaDownloadOutputFileType;
    destPath: string;
    range?: { start: number; end: number };
    offset?: number;
  }): Promise<void> {
    const url = type === "audio" ? this.audioUrl : this.videoUrl;
    if (!url) throw new Error(`${type} url is missing`);

    const headers: Record<string, string> = { ...this.getHeaders() };
    if (range) {
      headers.Range = `bytes=${range.start + offset}-${range.end}`;
    }

    const stream = got.stream(url, {
      method: "GET",
      headers,
      signal: this.abortSignal,
      retry: { limit: 3 },
    });

    stream.on("data", bf => {
      this.downloadedBytes += bf.length;
      this.downloadProgress =
        this.totalBytes && this.downloadedBytes ? Math.round((this.downloadedBytes / this.totalBytes) * 100) : 0;
      this.emitUpdate();
    });

    await pipeline(stream, fs.createWriteStream(destPath, { flags: offset > 0 ? "a" : "w" }), {
      signal: this.abortSignal,
    });
  }

  private async downloadChunks(): Promise<void> {
    this.chunkQueue = new PQueue({ concurrency: 5 });
    // 重置已下载字节数，重新计算
    this.downloadedBytes = 0;

    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      const chunkPath = path.join(this.tempDir, chunk.name);

      let currentSize = 0;
      if (fs.existsSync(chunkPath)) {
        const stat = fs.statSync(chunkPath);
        currentSize = stat.size;
      }

      const expectedSize = chunk.end - chunk.start + 1;

      // 校验chunk大小
      if (currentSize > expectedSize) {
        // 大小异常，删除重下
        await removeDirOrFile(chunkPath);
        currentSize = 0;
      } else if (currentSize === expectedSize) {
        // 已完成
        this.downloadedBytes += currentSize;
        chunk.done = true;
        this.emitUpdate();
        continue;
      }

      // 累加已存在的字节数（可能是部分下载）
      this.downloadedBytes += currentSize;

      this.chunkQueue?.add(() =>
        this.downloadChunk({
          type: chunk.type,
          name: chunk.name,
          start: chunk.start,
          end: chunk.end,
          destPath: chunkPath,
          offset: currentSize,
        }),
      );
    }

    await new Promise<void>((resolve, reject) => {
      const errorHandler = (error: Error) => {
        this.chunkQueue?.clear();
        this.chunkQueue?.off("error", errorHandler);
        reject(error);
      };

      this.chunkQueue?.on("error", errorHandler);

      this.chunkQueue?.onIdle().then(() => {
        this.chunkQueue?.off("error", errorHandler);
        resolve();
      });
    });
  }

  private async downloadChunk({
    type,
    name,
    start,
    end,
    destPath,
    offset = 0,
  }: {
    type: MediaDownloadOutputFileType;
    name: string;
    start: number;
    end: number;
    destPath: string;
    offset?: number;
  }): Promise<void> {
    await this.processDownload({ type, destPath, range: { start, end }, offset });

    const chunkIndex = this.chunks.findIndex(c => c.name === name);
    if (chunkIndex > -1) {
      this.chunks[chunkIndex].done = true;
    }
  }

  private async mergeChunks() {
    this.status = "merging";
    this.mergedBytes = 0;
    if (this.audioTempPath && fs.existsSync(this.audioTempPath)) {
      const audioMergedSize = fs.statSync(this.audioTempPath).size;
      this.mergedBytes += audioMergedSize;
    }
    if (this.videoTempPath && fs.existsSync(this.videoTempPath)) {
      const videoMergedSize = fs.statSync(this.videoTempPath).size;
      this.mergedBytes += videoMergedSize;
    }
    this.mergeProgress = this.totalBytes ? Math.round((this.mergedBytes / this.totalBytes) * 100) : 0;
    this.emitUpdate();
    await this.mergeChunkByFileType("audio", this.audioTempPath!);
    await this.mergeChunkByFileType("video", this.videoTempPath!);
    await this.deleteChunkFiles();
    this.chunks = [];
  }

  private async mergeChunkByFileType(type: MediaDownloadOutputFileType, destPath: string): Promise<void> {
    const chunks = this.chunks.filter(chunk => chunk.type === type);
    if (chunks.length === 0) return;

    let startIndex = 0;

    // 检查已合并的文件大小，支持断点合并
    if (fs.existsSync(destPath)) {
      const stat = fs.statSync(destPath);
      const mergedSize = stat.size;
      let accumulatedSize = 0;

      for (let i = 0; i < chunks.length; i++) {
        const chunkSize = chunks[i].end - chunks[i].start + 1;
        if (mergedSize >= accumulatedSize + chunkSize) {
          // 该chunk已完整合并
          accumulatedSize += chunkSize;
          startIndex = i + 1;
        } else {
          // 该chunk部分合并或未合并，截断文件到上一个完整chunk的结束位置
          try {
            const fd = fs.openSync(destPath, "r+");
            fs.ftruncateSync(fd, accumulatedSize);
            fs.closeSync(fd);
          } catch {
            // 如果截断失败，可能需要重头合并，这里简单处理为从0开始（通过不设置startIndex）
            await removeDirOrFile(destPath);
            startIndex = 0;
          }
          break;
        }
      }
    }

    if (startIndex >= chunks.length) {
      // 全部合并完成
      return;
    }

    if (this.abortSignal?.aborted) return;

    for (let i = startIndex; i < chunks.length; i++) {
      if (this.abortSignal?.aborted) {
        return;
      }

      const chunk = chunks[i];
      const chunkPath = path.join(this.tempDir, chunk.name);

      const readStream = fs.createReadStream(chunkPath);
      readStream.on("data", dataChunk => {
        this.mergedBytes += dataChunk.length;
        this.mergeProgress = this.totalBytes ? Math.round((this.mergedBytes / this.totalBytes) * 100) : 0;
        this.emitUpdate();
      });

      await pipeline(readStream, fs.createWriteStream(destPath, { flags: "a" }), {
        signal: this.abortSignal,
      });
    }
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
      savePath: this.savePath,
      error: this.error,
    });
  }
}
