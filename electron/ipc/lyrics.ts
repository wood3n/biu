import { ipcMain } from "electron";
import log from "electron-log";
import { File as TagFile } from "node-taglib-sharp";
import { fileURLToPath } from "node:url";

import { getLyricsByLrclib, type SeachSongByLrclibParams } from "./api/lrclib-lyric";
import {
  getLyricsByNetease,
  getSongByNetease,
  type GetLyricsByNeteaseParams,
  type SearchSongByNeteaseParams,
} from "./api/netease-lyric";
import { channel } from "./channel";

/**
 * 将渲染端传来的本地文件标识转换为真实文件系统路径。
 * 优先使用原始路径；若传入的是 file:// URL 则解析回路径。
 */
function resolveLocalPath(input: string): string {
  if (input.startsWith("file://")) {
    try {
      return fileURLToPath(input);
    } catch {
      // 渲染端 toFileUrl 未对路径转义，含空格/中文时 fileURLToPath 可能抛错，
      // 退回手动剥离前缀（与 toFileUrl 的拼接方式对应）。
      return decodeURI(input.replace(/^file:\/\//, ""));
    }
  }
  return input;
}

/** 读取本地音频文件内嵌的歌词文本，无则返回 null */
function readLocalLyrics(filePathOrUrl: string): string | null {
  const filePath = resolveLocalPath(filePathOrUrl);
  let file: TagFile | undefined;
  try {
    file = TagFile.createFromPath(filePath);
    const lyrics = file.tag.lyrics;
    return lyrics && lyrics.trim() ? lyrics : null;
  } catch (err) {
    log.error("[lyrics] read local lyrics error:", filePath, err);
    return null;
  } finally {
    file?.dispose();
  }
}

/** 将歌词文本写回本地音频文件的标签，返回是否成功 */
function writeLocalLyrics(filePathOrUrl: string, lyrics: string): boolean {
  const filePath = resolveLocalPath(filePathOrUrl);
  let file: TagFile | undefined;
  try {
    file = TagFile.createFromPath(filePath);
    file.tag.lyrics = lyrics ?? "";
    file.save();
    return true;
  } catch (err) {
    log.error("[lyrics] write local lyrics error:", filePath, err);
    return false;
  } finally {
    file?.dispose();
  }
}

export function registerLyricsHandlers() {
  ipcMain.handle(channel.lyrics.searchNeteaseSongs, async (_, params: SearchSongByNeteaseParams) => {
    return getSongByNetease(params);
  });

  ipcMain.handle(channel.lyrics.getNeteaseLyrics, async (_, params: GetLyricsByNeteaseParams) => {
    return getLyricsByNetease(params);
  });

  ipcMain.handle(channel.lyrics.searchLrclib, async (_, params: SeachSongByLrclibParams) => {
    return getLyricsByLrclib(params);
  });

  ipcMain.handle(channel.lyrics.readLocal, async (_, filePathOrUrl: string) => {
    if (!filePathOrUrl) return null;
    return readLocalLyrics(filePathOrUrl);
  });

  ipcMain.handle(channel.lyrics.writeLocal, async (_, payload: { filePath: string; lyrics: string }) => {
    if (!payload?.filePath) return false;
    return writeLocalLyrics(payload.filePath, payload.lyrics ?? "");
  });
}
