import log from "electron-log";
import { EventEmitter } from "events";
import fs from "fs";
import { createWriteStream } from "fs";
import got, { Options as GotOptions } from "got";
import PQueue from "p-queue";
import path from "path";
import { pipeline } from "stream/promises";

import { FFmpegProcessor } from "./ffmpeg-processor";
import { DownloadTask, DownloadStatus } from "./types";

const CHUNK_THRESHOLD = 20 * 1024 * 1024; // 20MB
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB

export class DownloadCore extends EventEmitter {
  public task: DownloadTask;
  private abortController: AbortController;
  private chunkQueue: PQueue;
  private ffmpegProcessor: FFmpegProcessor;

  private speedInterval: NodeJS.Timeout | null = null;
  private lastDownloadedBytes: number = 0;

  constructor(task: DownloadTask) {
    super();
    this.task = task;
    this.abortController = new AbortController();
    this.chunkQueue = new PQueue({ concurrency: 5 });
    this.ffmpegProcessor = new FFmpegProcessor();

    // Listen to ffmpeg progress
    this.ffmpegProcessor.on("progress", progress => {
      if (this.task.status === DownloadStatus.CONVERTING) {
        if (progress.percent) {
          this.task.progress.percent = progress.percent;
          this.emit("progress", this.task);
        }
      }
    });
  }

  private startSpeedMonitor() {
    if (this.speedInterval) clearInterval(this.speedInterval);
    this.lastDownloadedBytes = this.task.progress.downloadedBytes;

    this.speedInterval = setInterval(() => {
      const now = Date.now();
      const diff = this.task.progress.downloadedBytes - this.lastDownloadedBytes;
      this.lastDownloadedBytes = this.task.progress.downloadedBytes;

      // Speed in bytes/sec
      this.task.progress.speed = diff; // Since it's 1 sec interval

      // ETA
      if (this.task.progress.speed > 0 && this.task.progress.totalBytes > 0) {
        const remaining = this.task.progress.totalBytes - this.task.progress.downloadedBytes;
        this.task.progress.eta = Math.ceil(remaining / this.task.progress.speed);
      } else {
        this.task.progress.eta = 0;
      }

      this.emit("progress", this.task);
    }, 1000);
  }

  private stopSpeedMonitor() {
    if (this.speedInterval) {
      clearInterval(this.speedInterval);
      this.speedInterval = null;
    }
  }

  public async start(): Promise<void> {
    try {
      if (this.task.status === DownloadStatus.COMPLETED) return;

      this.updateStatus(DownloadStatus.DOWNLOADING);
      log.info(`[${this.task.id}] Starting download: ${this.task.options.url}`);

      // 1. Get Content-Length
      const contentLength = await this.getContentLength();
      this.task.progress.totalBytes = contentLength;
      this.task.progress.downloadedBytes = 0; // Reset for calculation

      this.startSpeedMonitor();

      // 2. Decide strategy
      const tempFile = this.getTempFilePath();
      const finalFile = path.join(this.task.options.savePath, this.task.options.fileName);

      // Create temp dir if not exists
      const tempDir = path.dirname(tempFile);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      if (contentLength > 0 && contentLength < CHUNK_THRESHOLD) {
        log.info(`[${this.task.id}] Strategy: Direct download`);
        await this.downloadDirect(tempFile);
      } else if (contentLength > 0) {
        log.info(`[${this.task.id}] Strategy: Chunked download`);
        await this.downloadChunked(contentLength, tempDir);
        log.info(`[${this.task.id}] Merging chunks`);
        await this.mergeChunks(contentLength, tempDir, tempFile);
      } else {
        // Fallback for unknown size
        await this.downloadDirect(tempFile);
      }

      // 3. Conversion if needed
      if (this.needsConversion(finalFile)) {
        this.updateStatus(DownloadStatus.CONVERTING);
        await this.ffmpegProcessor.convert(tempFile, finalFile, this.task.options.fileType);
        fs.unlinkSync(tempFile);
      } else {
        this.updateStatus(DownloadStatus.CONVERTING);
        await this.ffmpegProcessor.convert(tempFile, finalFile, this.task.options.fileType);
        fs.unlinkSync(tempFile);
      }
      log.info(`[${this.task.id}] Download completed`);

      // Cleanup chunks dir if used
      if (contentLength >= CHUNK_THRESHOLD) {
        fs.rmSync(path.join(tempDir, "chunks"), { recursive: true, force: true });
      }

      this.stopSpeedMonitor();

      this.updateStatus(DownloadStatus.COMPLETED);
      this.task.progress.percent = 100;
      this.emit("progress", this.task);
      this.emit("completed", this.task);
    } catch (error: any) {
      this.stopSpeedMonitor();
      if (error.name === "AbortError") {
        this.updateStatus(DownloadStatus.CANCELLED);
      } else {
        log.error(`[${this.task.id}] Error:`, error);
        this.task.error = {
          code: error.code || "UNKNOWN",
          message: error.message,
          stack: error.stack,
        };
        this.updateStatus(DownloadStatus.ERROR);
        this.emit("error", this.task);
      }
    }
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

  private async getContentLength(): Promise<number> {
    try {
      const response = await got.head(this.task.options.url, {
        headers: this.getHeaders(),
        timeout: { request: 5000 },
        retry: { limit: 3 },
      });
      const len = response.headers["content-length"];
      return len ? parseInt(len, 10) : 0;
    } catch (e) {
      log.warn(`[${this.task.id}] Failed to get content length, defaulting to 0`);
      return 0;
    }
  }

  private getHeaders() {
    return {
      Referer: this.task.options.referer,
      "User-Agent":
        this.task.options.userAgent ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Cookie: this.task.options.cookie,
      ...(this.task.options.userAgent ? {} : {}),
    };
  }

  private getTempFilePath(): string {
    // Store temp files in a subdirectory named by task ID to avoid collisions
    if (this.task.tempPath) return this.task.tempPath;

    // Default temp path: <savePath>/.temp/<taskId>/source.tmp
    const tempDir = path.join(this.task.options.savePath, ".temp", this.task.id);
    this.task.tempPath = path.join(tempDir, "source.tmp");
    return this.task.tempPath;
  }

  private async downloadDirect(destPath: string): Promise<void> {
    const downloadStream = got.stream(this.task.options.url, {
      headers: this.getHeaders(),
      isStream: true,
      signal: this.abortController.signal,
      retry: { limit: 3 }, // Basic retry
    });

    // Monitor progress
    downloadStream.on("downloadProgress", progress => {
      this.task.progress.downloadedBytes = progress.transferred;
      this.task.progress.percent = progress.percent * 100;
      // got provides percent (0-1)
      this.updateProgress(progress.transferred);
    });

    const fileStream = createWriteStream(destPath);
    await pipeline(downloadStream, fileStream);
  }

  private async downloadChunked(totalSize: number, tempDir: string): Promise<void> {
    const chunkDir = path.join(tempDir, "chunks");
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const chunksCount = Math.ceil(totalSize / CHUNK_SIZE);
    const promises = [];

    for (let i = 0; i < chunksCount; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min((i + 1) * CHUNK_SIZE - 1, totalSize - 1);
      const chunkPath = path.join(chunkDir, `part-${i}`);

      // Check if chunk exists and is complete
      if (fs.existsSync(chunkPath)) {
        const stat = fs.statSync(chunkPath);
        if (stat.size === end - start + 1) {
          this.task.progress.downloadedBytes += stat.size;
          continue; // Skip existing
        }
      }

      promises.push(
        this.chunkQueue.add(async () => {
          if (this.abortController.signal.aborted) return;

          await this.downloadChunk(this.task.options.url, start, end, chunkPath);
        }),
      );
    }

    await Promise.all(promises);
  }

  private async downloadChunk(url: string, start: number, end: number, destPath: string): Promise<void> {
    const options: GotOptions = {
      headers: {
        ...this.getHeaders(),
        Range: `bytes=${start}-${end}`,
      },
      signal: this.abortController.signal,
      retry: { limit: 3 },
    };

    const stream = got.stream(url, options);

    // We can't easily use global progress here because of concurrency mixing up "speed" calculation if we aren't careful.
    // But we can simply add transferred bytes to a global counter?
    // Better: let the main loop or timer calculate speed based on delta of downloadedBytes.
    // Here we just update downloadedBytes.

    let localDownloaded = 0;
    stream.on("data", chunk => {
      localDownloaded += chunk.length;
      this.task.progress.downloadedBytes += chunk.length;
      // Calculate percent
      if (this.task.progress.totalBytes > 0) {
        this.task.progress.percent = (this.task.progress.downloadedBytes / this.task.progress.totalBytes) * 100;
      }
      this.emit("progress", this.task);
    });

    const fileStream = createWriteStream(destPath);
    await pipeline(stream, fileStream);
  }

  private async mergeChunks(totalSize: number, tempDir: string, destPath: string): Promise<void> {
    const chunkDir = path.join(tempDir, "chunks");
    const chunksCount = Math.ceil(totalSize / CHUNK_SIZE);
    const writeStream = createWriteStream(destPath);

    for (let i = 0; i < chunksCount; i++) {
      const chunkPath = path.join(chunkDir, `part-${i}`);
      const data = await fs.promises.readFile(chunkPath);
      writeStream.write(data);
    }
    writeStream.end();

    return new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });
  }

  private cleanup() {
    // Logic to delete temp files if cancelled
    if (this.task.tempPath) {
      const tempDir = path.dirname(this.task.tempPath);
      // Be careful not to delete parent directories if shared, but here it is per taskID
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    }
  }

  private updateStatus(status: DownloadStatus) {
    this.task.status = status;
    this.task.updatedTime = Date.now();
    this.emit("status", this.task);
  }

  private updateProgress(transferred: number) {
    // Basic progress update wrapper
    this.emit("progress", this.task);
  }

  private needsConversion(finalFile: string): boolean {
    // Simple check: if file extension matches desired, maybe no conversion?
    // But user might want to re-encode.
    // Given the requirement "Integrate fluent-ffmpeg for format conversion",
    // we should probably always pass through ffmpeg to ensure quality/codec.
    return true;
  }
}
