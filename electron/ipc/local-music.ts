import { ipcMain } from "electron";
import log from "electron-log";
import { parseFile } from "music-metadata";
import crypto from "node:crypto";
import fsp from "node:fs/promises";
import path from "node:path";

import { channel } from "./channel";

const exts = new Set([".mp3", ".flac", ".wav", ".m4a", ".aac", ".ogg", ".wma", ".aiff"]);

async function walk(dir: string, list: string[]) {
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) continue;
      const full = path.join(dir, entry.name);
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) {
        list.push(full);
      }
    }
  } catch (err) {
    log.error("[local-music] walk error:", err);
  }
}

function toSafeTitle(filePath: string, metaTitle?: string) {
  if (metaTitle && metaTitle.trim()) return metaTitle.trim();
  return path.parse(filePath).name;
}

function isErrnoException(value: unknown): value is NodeJS.ErrnoException {
  return typeof value === "object" && value !== null && "code" in value;
}

export function registerLocalMusicHandlers() {
  ipcMain.handle(channel.localMusic.scan, async (_, dirs: string[]) => {
    const result: LocalMusicItem[] = [];
    if (!Array.isArray(dirs) || !dirs.length) return result;
    try {
      for (const dir of dirs) {
        const files: string[] = [];
        await walk(dir, files);
        for (const file of files) {
          try {
            const stat = await fsp.stat(file);
            let canonicalPath = file;
            try {
              canonicalPath = await fsp.realpath(file);
            } catch (err) {
              log.error("[local-music] realpath error:", file, err);
            }
            const meta = await parseFile(file).catch(() => null);
            const duration =
              meta?.format?.duration && Number.isFinite(meta.format.duration) ? meta.format.duration : undefined;
            const format = (path.extname(file).slice(1) || "").toLowerCase();
            result.push({
              id: crypto.createHash("md5").update(canonicalPath.toLowerCase(), "utf8").digest("hex"),
              path: file,
              dir,
              title: toSafeTitle(file, meta?.common?.title),
              size: stat.size,
              format,
              duration,
              createdTime: stat.birthtimeMs || stat.mtimeMs,
            });
          } catch (err) {
            log.error("[local-music] parse file error:", file, err);
          }
        }
      }
    } catch (err) {
      log.error("[local-music] scan error:", err);
    }
    return result;
  });

  ipcMain.handle(channel.localMusic.deleteFile, async (_, filePath: string) => {
    if (!filePath) return false;
    try {
      const stat = await fsp.stat(filePath);
      if (!stat.isFile()) return false;
      await fsp.unlink(filePath);
      return true;
    } catch (err) {
      if (isErrnoException(err) && err.code === "ENOENT") return false;
      log.error("[local-music] delete file error:", filePath, err);
      return false;
    }
  });
}
