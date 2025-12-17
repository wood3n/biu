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
};
