import type { IpcMainInvokeEvent } from "electron";

import { ipcMain, app, net } from "electron";
import ffmpeg from "fluent-ffmpeg";
import fss from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { store, storeKey } from "../store";
import { channel } from "./channel";

// 清理文件名中的非法字符（适配 Windows/macOS/Linux）
function sanitizeFilename(filename: string): string {
  return (
    filename
      .replace(/[<>:"|?*\\/]/g, "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x80-\x9f]/g, "")
      .replace(/^\.+/, "")
      .replace(/\.+$/, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 200)
  );
}

async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

interface DownloadToFileOptions {
  url: string;
  filePath: string;
  referer?: string;
  userAgent?: string;
}

// 使用 Electron net 模块下载到指定文件，并附带自定义 HTTP 头
function downloadToFile({ url, filePath, referer, userAgent }: DownloadToFileOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const request = net.request(url);
      if (referer) request.setHeader("Referer", referer);
      if (userAgent) request.setHeader("User-Agent", userAgent);

      request.on("response", response => {
        if ((response.statusCode ?? 0) >= 400) {
          reject(new Error(`下载失败，HTTP ${response.statusCode}`));
          return;
        }

        const writeStream = fss.createWriteStream(filePath);
        response.on("error", err => {
          writeStream.destroy();
          reject(err);
        });
        writeStream.on("error", err => {
          reject(err);
        });
        writeStream.on("finish", () => resolve(filePath));
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
    } catch {}
  }
}

interface StartDownloadPayload {
  title: string;
  videoUrl: string;
  audioUrl: string;
}

export function registerDownloadHandlers() {
  ipcMain.handle(
    channel.download.start,
    async (event: IpcMainInvokeEvent, { title, videoUrl, audioUrl }: StartDownloadPayload) => {
      try {
        const ffmpegPath = process.env.FFMPEG_PATH;
        if (ffmpegPath) {
          ffmpeg.setFfmpegPath(ffmpegPath);
        }
      } catch {}

      const settings = store.get(storeKey.appSettings);
      const downloadDir = settings?.downloadPath || app.getPath("downloads");
      await ensureDir(downloadDir);

      const safeTitle = sanitizeFilename(title || "download");
      const outputFilename = `${safeTitle}.mp4`;
      const outputPath = path.join(downloadDir, outputFilename);

      const tempDir = path.join(app.getPath("temp"), "biu-downloads");
      await ensureDir(tempDir);
      const unique = Date.now();
      const tempVideoPath = path.join(tempDir, `${safeTitle}-${unique}.video.tmp`);
      const tempAudioPath = path.join(tempDir, `${safeTitle}-${unique}.audio.tmp`);

      const userAgent =
        (event?.sender?.getUserAgent?.() as string | undefined) ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
      const getReferer = (u: string): string => {
        try {
          const origin = new URL(u).origin;
          if (origin.includes("bilibili")) return "https://www.bilibili.com";
          if (origin.includes("bilivideo")) return "https://www.bilibili.com";
          return origin;
        } catch {
          return "";
        }
      };
      const videoReferer = getReferer(videoUrl);
      const audioReferer = getReferer(audioUrl);

      try {
        await Promise.all([
          downloadToFile({ url: videoUrl, filePath: tempVideoPath, referer: videoReferer, userAgent }),
          downloadToFile({ url: audioUrl, filePath: tempAudioPath, referer: audioReferer, userAgent }),
        ]);

        await new Promise<void>((resolve, reject) => {
          ffmpeg()
            .input(tempVideoPath)
            .input(tempAudioPath)
            .outputOptions(["-c:v copy", "-c:a copy", "-map 0:v:0", "-map 1:a:0"])
            .on("error", async err => {
              try {
                await fs.unlink(outputPath).catch(() => {});
              } catch {}
              reject(err);
            })
            .on("end", () => resolve())
            .save(outputPath);
        });

        await cleanupTempFiles([tempVideoPath, tempAudioPath]);

        return {
          success: true,
          filePath: outputPath,
          filename: outputFilename,
        } as const;
      } catch (error) {
        await cleanupTempFiles([tempVideoPath, tempAudioPath]);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
  );

  ipcMain.handle(channel.download.list, async () => {
    try {
      const settings = store.get(storeKey.appSettings);
      const downloadDir = settings?.downloadPath || app.getPath("downloads");
      const entries = await fs.readdir(downloadDir, { withFileTypes: true });

      const files: Array<{ name: string; format: string; size: number; time: number }> = [];
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        const filePath = path.join(downloadDir, entry.name);
        try {
          const stat = await fs.stat(filePath);
          const ext = path.extname(entry.name).replace(/^\./, "").toLowerCase();
          files.push({
            name: entry.name,
            format: ext || "unknown",
            size: stat.size,
            time: stat.mtimeMs,
          });
        } catch {}
      }
      files.sort((a, b) => b.time - a.time);
      return files;
    } catch (error) {
      console.error("读取下载目录失败", error);
      return [];
    }
  });
}
