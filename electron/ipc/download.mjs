import { ipcMain, app, net } from "electron";
import ffmpeg from "fluent-ffmpeg";
import fss from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

import { store, storeKey } from "../store.mjs";
import { channel } from "./channel.mjs";

// 清理文件名中的非法字符（适配 Windows/macOS/Linux）
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"|?*\\/]/g, "") // Windows 禁止字符
    .replace(/[\x00-\x1f\x80-\x9f]/g, "") // 控制字符
    .replace(/^\.+/, "") // 开头的点
    .replace(/\.+$/, "") // 结尾的点
    .replace(/\s+/g, " ") // 多空格合并
    .trim()
    .substring(0, 200);
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

// 使用 Electron net 模块下载到指定文件，并附带自定义 HTTP 头
function downloadToFile({ url, filePath, referer, userAgent }) {
  return new Promise((resolve, reject) => {
    try {
      const request = net.request(url);
      // 设置必要的请求头
      if (referer) request.setHeader("Referer", referer);
      if (userAgent) request.setHeader("User-Agent", userAgent);

      request.on("response", response => {
        if (response.statusCode >= 400) {
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
        response.pipe(writeStream);
      });

      request.on("error", err => reject(err));
      request.end();
    } catch (error) {
      reject(error);
    }
  });
}

// 清理临时文件（忽略不可用的错误）
async function cleanupTempFiles(files) {
  for (const file of files) {
    try {
      if (!file) continue;
      await fs.unlink(file).catch(() => {});
    } catch {}
  }
}

export function registerDownloadHandlers() {
  ipcMain.handle(channel.download.start, async (event, { title, videoUrl, audioUrl }) => {
    // 若设置了 FFMPEG_PATH，则显式指定 ffmpeg 二进制路径
    try {
      const ffmpegPath = process.env.FFMPEG_PATH;
      if (ffmpegPath) {
        ffmpeg.setFfmpegPath(ffmpegPath);
      }
    } catch {}
    // 读取下载目录（用户设置或系统下载目录）
    const settings = store.get(storeKey.appSettings);
    const downloadDir = settings?.downloadPath || app.getPath("downloads");
    await ensureDir(downloadDir);

    // 生成安全的文件名
    const safeTitle = sanitizeFilename(title || "download");
    const outputFilename = `${safeTitle}.mp4`;
    const outputPath = path.join(downloadDir, outputFilename);

    // 临时目录与文件
    const tempDir = path.join(app.getPath("temp"), "biu-downloads");
    await ensureDir(tempDir);
    const unique = Date.now();
    const tempVideoPath = path.join(tempDir, `${safeTitle}-${unique}.video.tmp`);
    const tempAudioPath = path.join(tempDir, `${safeTitle}-${unique}.audio.tmp`);

    // 请求头：优先使用应用的 User-Agent；Referer 对 bilibili 设为主页，否则用 url 的 origin
    const userAgent =
      event?.sender?.getUserAgent?.() ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
    const getReferer = u => {
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
      // 并发下载音视频
      await Promise.all([
        downloadToFile({ url: videoUrl, filePath: tempVideoPath, referer: videoReferer, userAgent }),
        downloadToFile({ url: audioUrl, filePath: tempAudioPath, referer: audioReferer, userAgent }),
      ]);

      // 合并音频到视频，输出 mp4
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempVideoPath)
          .input(tempAudioPath)
          .outputOptions(["-c:v copy", "-c:a copy", "-map 0:v:0", "-map 1:a:0"])
          .on("error", async err => {
            // 合并失败清理部分输出
            try {
              await fs.unlink(outputPath).catch(() => {});
            } catch {}
            reject(err);
          })
          .on("end", () => resolve(true))
          .save(outputPath);
      });

      // 成功后清理临时文件
      await cleanupTempFiles([tempVideoPath, tempAudioPath]);

      return {
        success: true,
        filePath: outputPath,
        filename: outputFilename,
      };
    } catch (error) {
      // 任一阶段失败：清理临时文件
      await cleanupTempFiles([tempVideoPath, tempAudioPath]);
      throw error instanceof Error ? error : new Error(String(error));
    }
  });

  // 列出下载目录中的文件（名称、格式、大小、下载时间）
  ipcMain.handle(channel.download.list, async () => {
    try {
      const settings = store.get(storeKey.appSettings);
      const downloadDir = settings?.downloadPath || app.getPath("downloads");
      const entries = await fs.readdir(downloadDir, { withFileTypes: true });

      const files = [];
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
