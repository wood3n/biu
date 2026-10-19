import { create } from "zustand";

import type { WebPlayerParams } from "@/service/web-player";

import { getLyricsByBili } from "@/components/lyrics/get-lyrics";
import { StoreNameMap } from "@shared/store";

import { usePlayList } from "./play-list";

const timeTagPattern = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

/** 解析 LRC 格式的歌词文本 */
export function parseLrc(raw?: null | string): LyricLine[] {
  if (!raw) return [];

  const result: LyricLine[] = [];
  const lines = raw.split(/\r?\n/);

  lines.forEach(line => {
    const text = line.replace(timeTagPattern, "").trim();
    if (!text) return;

    let match: null | RegExpExecArray;
    while ((match = timeTagPattern.exec(line)) !== null) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const millis = match[3] ? Number(match[3].padEnd(3, "0")) : 0;

      if (Number.isNaN(minutes) || Number.isNaN(seconds) || Number.isNaN(millis)) continue;

      const time = Math.max(0, minutes * 60 * 1000 + seconds * 1000 + millis);
      result.push({ text, time });
    }

    timeTagPattern.lastIndex = 0;
  });

  return result.toSorted((a, b) => a.time - b.time);
}

/** 当前播放歌曲对应的歌词缓存 key（bvid-cid），本地音乐/普通音频没有歌词来源 */
export function getLyricsCacheKey(bvid?: string, cid?: string) {
  return bvid && cid ? `${bvid}-${cid}` : null;
}

/** 计算当前毫秒进度对应的歌词行下标，未到第一句时返回 -1 */
export function getActiveLyricIndex(lyrics: LyricLine[], currentMs: number) {
  if (!lyrics.length) return -1;
  if (currentMs < lyrics[0].time) return -1;

  let left = 0;
  let right = lyrics.length - 1;
  let index = 0;

  while (left <= right) {
    const mid = (left + right) >> 1;
    if (lyrics[mid].time <= currentMs) {
      index = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return index;
}

interface LyricsState {
  /** 当前歌词对应的缓存 key */
  cacheKey: null | string;
  /** 原文歌词 */
  lyrics: LyricLine[];
  /** 翻译歌词 */
  translatedLyrics: LyricLine[];
  /** 是否正在加载 */
  isLoading: boolean;
  /** 是否已完成一次加载（用于区分「加载中」和「确认没有歌词」） */
  isLoaded: boolean;
  /** 加载当前播放歌曲的歌词（内部做去重，可被多处同时调用） */
  load: () => Promise<void>;
  /** 使用用户手动选择/搜索到的歌词 */
  applyLyrics: (lyricsText?: string, tLyricsText?: string) => void;
  reset: () => void;
}

let requestSeq = 0;

const readCachedLyrics = async (cacheKey: string): Promise<MusicLyrics | null> => {
  try {
    const cache = await window.electron?.getStore(StoreNameMap.LyricsCache);
    return cache?.[cacheKey] ?? null;
  } catch {
    return null;
  }
};

export const useLyricsStore = create<LyricsState>((set, get) => ({
  cacheKey: null,
  lyrics: [],
  translatedLyrics: [],
  isLoading: false,
  isLoaded: false,
  reset: () => {
    requestSeq += 1;
    set({ cacheKey: null, lyrics: [], translatedLyrics: [], isLoading: false, isLoaded: false });
  },
  applyLyrics: (lyricsText, tLyricsText) => {
    set({
      lyrics: parseLrc(lyricsText),
      translatedLyrics: parseLrc(tLyricsText),
      isLoading: false,
      isLoaded: true,
    });
  },
  load: async () => {
    const playItem = usePlayList.getState().getPlayItem();
    const cacheKey = getLyricsCacheKey(playItem?.bvid, playItem?.cid);

    if (!cacheKey) {
      set({ cacheKey: null, lyrics: [], translatedLyrics: [], isLoading: false, isLoaded: true });
      return;
    }

    // 同一首歌已经加载过或正在加载，避免重复请求
    if (get().cacheKey === cacheKey && (get().isLoaded || get().isLoading)) {
      return;
    }

    const seq = ++requestSeq;
    set({ cacheKey, lyrics: [], translatedLyrics: [], isLoading: true, isLoaded: false });

    try {
      // 优先使用手动搜索/调整过偏移的缓存歌词
      const cached = await readCachedLyrics(cacheKey);
      if (seq !== requestSeq) return;

      if (cached?.lyrics || cached?.tLyrics) {
        set({
          lyrics: parseLrc(cached.lyrics),
          translatedLyrics: parseLrc(cached.tLyrics),
          isLoading: false,
          isLoaded: true,
        });
        return;
      }

      const cid = Number(playItem?.cid);
      if (!Number.isFinite(cid)) {
        set({ lyrics: [], translatedLyrics: [], isLoading: false, isLoaded: true });
        return;
      }

      const params: WebPlayerParams = { cid };

      if (playItem?.bvid) params.bvid = playItem.bvid;

      const aid = playItem?.aid ? Number(playItem.aid) : undefined;
      if (aid && !Number.isNaN(aid)) {
        params.aid = aid;
      }

      const body = await getLyricsByBili(params);
      if (seq !== requestSeq) return;

      set({ lyrics: body ?? [], translatedLyrics: [], isLoading: false, isLoaded: true });
    } catch {
      if (seq !== requestSeq) return;
      set({ lyrics: [], translatedLyrics: [], isLoading: false, isLoaded: true });
    }
  },
}));
