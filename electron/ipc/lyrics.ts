import { ipcMain } from "electron";

import { getLyricsByLrclib, type SeachSongByLrclibParams } from "./api/lrclib-lyric";
import {
  getLyricsByNetease,
  getSongByNetease,
  type GetLyricsByNeteaseParams,
  type SearchSongByNeteaseParams,
} from "./api/netease-lyric";
import { channel } from "./channel";

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
}
