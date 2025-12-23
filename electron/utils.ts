import isDev from "electron-is-dev";
import log from "electron-log";
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs";
import path from "node:path";

import { ELECTRON_ICON_BASE_PATH } from "@shared/path";

import { appSettingsStore } from "./store";

export const IconBase = isDev ? process.cwd() : process.resourcesPath;

export const getWindowIcon = () =>
  process.platform === "darwin"
    ? undefined
    : path.resolve(IconBase, ELECTRON_ICON_BASE_PATH, process.platform === "win32" ? "logo.ico" : "logo.png");

export const fixFfmpegPath = () => {
  try {
    const settings = appSettingsStore.get("appSettings");
    if (settings?.ffmpegPath && fs.existsSync(settings.ffmpegPath)) {
      log.info(`Found user configured ffmpeg at ${settings.ffmpegPath}`);
      ffmpeg.setFfmpegPath(settings.ffmpegPath);
      return;
    }
  } catch (err) {
    log.error("Error reading ffmpeg path from settings:", err);
  }

  if (process.platform === "darwin" || process.platform === "linux") {
    const paths = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg", "/snap/bin/ffmpeg"];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        log.info(`Found ffmpeg at ${p}`);
        ffmpeg.setFfmpegPath(p);
        return;
      }
    }
  }

  const getFfmpegName = () => {
    switch (process.platform) {
      case "win32":
        return "ffmpeg.exe";
      case "darwin":
        return process.arch === "arm64" ? "ffmpeg-mac-arm64" : "ffmpeg-mac-x64";
      case "linux":
        return "ffmpeg-linux";
      default:
        return "ffmpeg";
    }
  };

  const localFfmpegPath = path.join(
    isDev ? process.cwd() : process.resourcesPath,
    "electron",
    "ffmpeg",
    getFfmpegName(),
  );

  if (fs.existsSync(localFfmpegPath)) {
    log.info(`Found local ffmpeg at ${localFfmpegPath}`);
    if (process.platform !== "win32") {
      try {
        fs.chmodSync(localFfmpegPath, "755");
      } catch (err) {
        log.error(`Failed to chmod ffmpeg at ${localFfmpegPath}`, err);
      }
    }
    ffmpeg.setFfmpegPath(localFfmpegPath);
    return;
  }
};

const entities = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"',
  nbsp: " ",
};

/**
 * 将包含 HTML 和特殊字符的字符串转换为合法的文件名
 */
export function sanitizeFilename(input?: string, replacement = "_") {
  if (!input) return "";

  const decoded = input.replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});/gi, (match, entity) => {
    return entities[entity.toLowerCase()] || match;
  });

  const noHtml = decoded.replace(/<[^>]+>/g, "");

  // 替换 Windows/Linux 文件名非法字符
  // 非法集：\ / : * ? " < > | 以及控制字符
  // eslint-disable-next-line no-control-regex
  const illegalRe = /[\\/:*?"<>|\x00-\x1f\x80-\x9f]/g;
  const sanitized = noHtml.replace(illegalRe, replacement);

  return sanitized.replace(/\s+/g, " ").trim().replace(/\.$/, "").slice(0, 255); // 截断长度，防止文件名过长
}
