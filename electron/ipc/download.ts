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

// 渲染端调用参数（与 preload 暴露的 DownloadOptions 对齐，并扩展 format）
interface StartDownloadPayload {
  id: string;
  filename: string;
  audioUrl: string;
  videoUrl?: string;
  /** 目标封装格式，未指定时默认 mp3 */
  format?: "mp3" | "flac";
}

async function getAudioCodec(input: string): Promise<string | null> {
  return new Promise(resolve => {
    try {
      ffmpeg.ffprobe(input, (err, data) => {
        if (err) {
          log.warn("[download] ffprobe failed:", err);
          resolve(null);
          return;
        }
        const s = data.streams?.find(st => st.codec_type === "audio");
        console.log("ffprobe audio codec:", s?.codec_name);
        resolve(s?.codec_name ?? null);
      });
    } catch (e) {
      log.warn("[download] ffprobe exception:", e);
      resolve(null);
    }
  });
}

export function registerDownloadHandlers() {
  ipcMain.handle(
    channel.download.start,
    async (event: IpcMainInvokeEvent, { id, filename, audioUrl, format = "mp3" }: StartDownloadPayload) => {
      try {
        const ffmpegPath = process.env.FFMPEG_PATH;
        if (ffmpegPath) {
          ffmpeg.setFfmpegPath(ffmpegPath);
        }
      } catch (err) {
        // 修改说明：设置 ffmpeg 路径失败时记录警告，不影响下载逻辑
        log.warn("[download] setFfmpegPath failed:", err);
      }

      const settings = store.get(storeKey.appSettings);
      const downloadDir = settings?.downloadPath || app.getPath("downloads");
      console.log("downloadDir:", downloadDir);
      await ensureDir(downloadDir);
      const outputPath = path.join(downloadDir, filename);

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

        // 判断是否需要转码：如果目标为 mp3/aac/wav 且输入已是目标编解码/容器，可直接复制
        let needTranscode = true;
        try {
          const codec = await getAudioCodec(tempAudioPath);
          if (codec) {
            if (format === "mp3" && codec.toLowerCase().includes("mp3")) needTranscode = false;
            if (format === "flac" && codec.toLowerCase().includes("flac")) needTranscode = false;
          }
        } catch {
          // ffprobe 失败时按需转码以保证输出一致
          needTranscode = true;
        }

        if (!needTranscode) {
          try {
            await fs.copyFile(tempAudioPath, outputPath);
          } catch (copyErr) {
            log.warn("[download] copy passthrough failed:", copyErr);
            needTranscode = true;
          }
        }

        if (needTranscode) {
          await new Promise<void>((resolve, reject) => {
            const command = ffmpeg().input(tempAudioPath).noVideo();

            if (format === "mp3") {
              command.audioCodec("libmp3lame").outputOptions(["-q:a 2"]).format("mp3");
            }

            command
              .on("progress", info => {
                const p = Math.max(0, Math.min(100, Math.floor(info.percent ?? 0)));
                if (p > 0) {
                  send({ id, status: "merging" });
                }
              })
              .on("error", async err => {
                try {
                  await fs.unlink(outputPath).catch(() => {});
                } catch (cleanupErr) {
                  log.warn("[download] cleanup output file failed:", cleanupErr);
                }
                send({ id: id, status: "failed", error: "audio convert failed" });
                reject(err);
              })
              .on("end", () => resolve())
              .save(outputPath);
          });
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

  ipcMain.handle(channel.download.checkExists, async (_, filename: string) => {
    try {
      const settings = store.get(storeKey.appSettings);
      const downloadDir = settings?.downloadPath || app.getPath("downloads");
      const filePath = path.join(downloadDir, filename);
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      return exists;
    } catch (error) {
      log.error("[download] check file exists failed:", error);
      return false;
    }
  });
}
