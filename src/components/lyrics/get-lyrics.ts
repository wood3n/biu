import { getLyric } from "@/service/ai-lyrics";
import { getWebPlayerInfo, type WebPlayerParams } from "@/service/web-player";
import { StoreNameMap } from "@shared/store";

const timeTagPattern = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

export function parseLrcToLines(raw?: string | null) {
  if (!raw) return [] as LyricLine[];

  const result: LyricLine[] = [];
  const lines = raw.split(/\r?\n/);

  for (const line of lines) {
    const text = line.replace(timeTagPattern, "").trim();
    if (!text) continue;

    let match: RegExpExecArray | null;
    timeTagPattern.lastIndex = 0;
    while ((match = timeTagPattern.exec(line)) !== null) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const millis = match[3] ? Number(match[3].padEnd(3, "0")) : 0;
      if (Number.isNaN(minutes) || Number.isNaN(seconds) || Number.isNaN(millis)) continue;
      const time = Math.max(0, minutes * 60 * 1000 + seconds * 1000 + millis);
      result.push({ time, text });
    }
  }

  return result.toSorted((a, b) => a.time - b.time);
}

/**
 * 尝试从网易云搜索歌词
 * 返回 { lyrics, tLyrics } 原始 LRC 文本（未解析），找不到则返回 null
 */
async function searchNeteaseLyrics(keyword: string): Promise<{ lyrics: string; tLyrics: string } | null> {
  try {
    const searchRes = await window.electron.searchNeteaseSongs({
      s: keyword,
      type: 1,
      limit: 5,
      offset: 0,
    });
    const firstSong = searchRes?.result?.songs?.[0];
    if (!firstSong?.id) return null;

    const lyricsRes = await window.electron.getNeteaseLyrics({ id: firstSong.id });
    const lyrics = lyricsRes?.lrc?.lyric?.trim() || lyricsRes?.klyric?.lyric?.trim() || "";
    const tLyrics = lyricsRes?.tlyric?.lyric?.trim() || "";
    if (!lyrics) return null;

    return { lyrics, tLyrics };
  } catch {
    return null;
  }
}

/**
 * 尝试从 LrcLib 搜索歌词
 * 返回原始 synced LRC 文本，找不到则返回 null
 */
async function searchLrclibLyrics(keyword: string): Promise<string | null> {
  try {
    const res = await window.electron.searchLrclibLyrics({ q: keyword });
    const first = res?.find(item => item.syncedLyrics?.trim());
    return first?.syncedLyrics?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * 将原始 LRC 文本写入 LyricsCache（与手动搜索采用同一缓存结构）
 */
async function cacheLyrics(bvid: string, cid: string, lyrics: string, tLyrics?: string) {
  try {
    const store = await window.electron.getStore(StoreNameMap.LyricsCache);
    const key = `${bvid}-${cid}`;
    const prev = store?.[key] || {};
    await window.electron.setStore(StoreNameMap.LyricsCache, {
      ...(store || {}),
      [key]: { ...prev, lyrics, tLyrics },
    });
  } catch {
    // 缓存失败不阻塞
  }
}

export async function getLyricsByBili(params: WebPlayerParams) {
  const res = await getWebPlayerInfo(params);
  const subTitleUrl =
    res?.data?.subtitle?.subtitles?.[0]?.subtitle_url || res?.data?.subtitle?.subtitles?.[0]?.subtitle_url_v2;

  if (subTitleUrl) {
    const getLyricsRes = await getLyric(subTitleUrl);
    return (
      getLyricsRes?.body
        ?.map(item => {
          const raw = item.content ?? "";
          const cleaned = raw.replace(/^[♪♫]+|[♪♫]+$/g, "").trim();
          return {
            time: Math.max(0, Math.round((item.from ?? 0) * 1000)),
            text: cleaned,
          };
        })
        .filter(item => item.text)
        .toSorted((a, b) => a.time - b.time) ?? []
    );
  }

  return null;
}

/**
 * 自动搜索歌词的 fallback 链：
 * 1. B 站 CC 字幕（getLyricsByBili）
 * 2. 网易云音乐搜索
 * 3. LrcLib 搜索
 *
 * 找到后自动缓存到 LyricsCache，避免重复搜索。
 * 返回解析后的 { lyrics, tLyrics }，找不到则返回 null。
 */
export async function getLyricsAuto(
  params: WebPlayerParams,
  keyword: string,
  bvid?: string,
  cid?: string,
): Promise<{ lyrics: LyricLine[]; tLyrics: LyricLine[] } | null> {
  // 1. B 站字幕
  const biliResult = await getLyricsByBili(params);
  if (biliResult?.length) return { lyrics: biliResult, tLyrics: [] };

  // 2. 网易云
  const neteaseResult = await searchNeteaseLyrics(keyword);
  if (neteaseResult) {
    if (bvid && cid) await cacheLyrics(bvid, cid, neteaseResult.lyrics, neteaseResult.tLyrics);
    const parsed = parseLrcToLines(neteaseResult.lyrics);
    if (parsed.length) {
      const parsedT = parseLrcToLines(neteaseResult.tLyrics);
      return { lyrics: parsed, tLyrics: parsedT };
    }
  }

  // 3. LrcLib
  const lrclibResult = await searchLrclibLyrics(keyword);
  if (lrclibResult) {
    if (bvid && cid) await cacheLyrics(bvid, cid, lrclibResult);
    const parsed = parseLrcToLines(lrclibResult);
    if (parsed.length) return { lyrics: parsed, tLyrics: [] };
  }

  return null;
}
