import type { IpcMainInvokeEvent } from "electron";

import { ipcMain, app, net } from "electron";
import log from "electron-log";
import ffmpeg from "fluent-ffmpeg";
import fss from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { UserAgent } from "../network/user-agent";
import { store, storeKey } from "../store";
import { channel } from "./channel";

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    // 修改说明：目录创建失败时记录警告，避免静默
    log.error("[download] ensureDir failed:", err);
  }
}

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

interface DownloadToFileOptions {
  url: string;
  filePath: string;
  referer?: string;
  userAgent?: string;
  onProgress: (downloadedBytes: number, totalBytes: number) => void;
}

// 支持断点续传与进度回调
function downloadToFileWithResume({ url, filePath, onProgress }: DownloadToFileOptions) {
  return new Promise((resolve, reject) => {
    try {
      let start = 0;
      try {
        const stat = fss.statSync(filePath);
        start = stat.size || 0;
      } catch {
        // 如果文件不存在，视为从0开始下载
        start = 0;
      }

      const request = net.request(url);
      request.setHeader("Referer", "https://www.bilibili.com");
      request.setHeader("User-Agent", UserAgent);
      if (start > 0) request.setHeader("Range", `bytes=${start}-`);

      request.on("response", response => {
        const statusCode = response.statusCode ?? 0;
        if (statusCode >= 400) {
          reject(new Error(`下载失败，HTTP ${statusCode}`));
          return;
        }

        const contentLengthHeader = response.headers["content-length"];
        const remainingBytes = Number(contentLengthHeader ?? 0);
        const totalBytes = remainingBytes + start;

        const writeStream = fss.createWriteStream(filePath, { flags: start > 0 ? "a" : "w" });
        let downloaded = start;

        response.on("data", (chunk: Buffer) => {
          downloaded += chunk.length;
          onProgress(downloaded, totalBytes);
        });

        response.on("error", err => {
          writeStream.destroy();
          reject(err);
        });

        writeStream.on("error", err => reject(err));
        writeStream.on("finish", () => resolve({ filePath, totalBytes }));

        (response as any).pipe(writeStream);
      });

      request.on("error", err => reject(err));
      request.end();
    } catch (error) {
      reject(error);
    }
  });
}

// 清理临时文件（忽略不可用的错误）
async function cleanupTempFiles(files: Array<string | undefined | null>): Promise<void> {
  for (const file of files) {
    try {
      if (!file) continue;
      await fs.unlink(file).catch(() => {});
    } catch (err) {
      // 修改说明：清理临时文件失败时记录警告，忽略错误
      log.warn("[download] cleanup temp file failed:", err);
    }
  }
}

export function registerDownloadHandlers() {
  ipcMain.handle(
    channel.download.start,
    async (
      event: IpcMainInvokeEvent,
      { id, filename, audioUrl, isLossless }: DownloadOptions,
    ): Promise<StartDownloadResponse> => {
      const settings = store.get(storeKey.appSettings);
      const downloadDir = settings?.downloadPath || app.getPath("downloads");
      await ensureDir(downloadDir);
      const outputPath = path.join(downloadDir, filename);

      const fileExists = await checkFileExists(outputPath);
      if (fileExists) {
        return { success: false, error: "文件已存在" };
      }

      const tempDir = path.join(app.getPath("temp"), "biu-downloads");
      await ensureDir(tempDir);
      const tempAudioPath = path.join(tempDir, `${id}.audio.tmp`);

      const send = (params: DownloadCallbackParams) => {
        try {
          event.sender.send(channel.download.progress, params);
        } catch (e) {
          log.warn("[download] send progress failed:", e);
        }
      };

      try {
        // 音频下载
        let audioTotal = 0;
        await downloadToFileWithResume({
          url: audioUrl,
          filePath: tempAudioPath,
          onProgress: (downloaded, total) => {
            audioTotal = total || audioTotal;
            const progress = total > 0 ? Math.floor((downloaded / total) * 100) : undefined;
            send({
              id,
              status: "downloading",
              progress,
              downloadedBytes: downloaded,
              totalBytes: total,
            });
          },
        });

        // 封装/转换阶段
        send({ id, status: "merging" });

        if (isLossless) {
          try {
            await fs.copyFile(tempAudioPath, outputPath);
          } catch (copyErr) {
            log.warn("[download] copy passthrough failed:", copyErr);
          }
        } else {
          try {
            const ffmpegPath = process.env.FFMPEG_PATH;
            if (ffmpegPath) {
              ffmpeg.setFfmpegPath(ffmpegPath);
            }
          } catch (err) {
            // 修改说明：设置 ffmpeg 路径失败时记录警告，不影响下载逻辑
            log.warn("[download] setFfmpegPath failed:", err);
          }

          const command = ffmpeg().input(tempAudioPath).noVideo();
          command.audioCodec("libmp3lame").outputOptions(["-q:a 2"]).format("mp3");

          command
            .on("progress", info => {
              const p = Math.max(0, Math.min(100, Math.floor(info.percent ?? 0)));
              if (p > 0) {
                send({ id, status: "merging" });
              }
            })
            .on("error", async () => {
              try {
                await fs.unlink(outputPath).catch(() => {});
              } catch (cleanupErr) {
                log.warn("[download] cleanup output file failed:", cleanupErr);
              }
            })
            .save(outputPath);
        }

        await cleanupTempFiles([tempAudioPath]);

        send({ id, status: "completed", progress: 100 });
        return { success: true } as const;
      } catch (error) {
        await cleanupTempFiles([tempAudioPath]);
        send({ id, status: "failed", error: "download error" });
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
  );
}
