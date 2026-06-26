import { useCallback, useRef, useState } from "react";

import { addToast } from "@heroui/react";
import PQueue from "p-queue";

import type { BatchResultItem } from "./batch-result";

/** 单首匹配结果状态 */
export type MatchStatus = "matched" | "skipped" | "miss" | "failed";

interface BatchProgress {
  running: boolean;
  done: number;
  total: number;
}

/** 匹配选项：时长容忍阈值（秒）+ 是否覆盖已有歌词 */
export interface MatchOptions {
  toleranceSec: number;
  overwrite: boolean;
}

const CONCURRENCY = 3;
const SEARCH_LIMIT = 10;
/** 时长差容忍阈值（秒） */
const DURATION_TOLERANCE_SEC = 5;
/** 候选名含这些字样（大小写不敏感）视为伴奏/无人声版本，直接排除 */
const INSTRUMENTAL_KEYWORDS = ["伴奏", "纯音乐", "instrumental", "inst.", "off vocal", "karaoke"];

/** 候选名是否为伴奏/无人声版本 */
function isInstrumental(name?: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return INSTRUMENTAL_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * 通用「按时长差择优」：在已过滤好的候选中选时长差 ≤ tolerance、差最小者。
 * - 稳定排序保证「差相同取第一个」；
 * - 本地无时长时无法排序，退化为取第一个候选；
 * - 候选时长缺失视为无穷大差（被阈值排除）。
 * @param getDurationSec 返回候选时长（秒）；缺失返回 undefined
 * 无满足条件返回 null。
 */
function rankByDuration<T>(
  candidates: T[],
  localDurationSec: number | undefined,
  getDurationSec: (item: T) => number | undefined,
  toleranceSec: number,
): T | null {
  if (!candidates.length) return null;

  // 本地无时长：无法按差排序，直接取第一个
  if (typeof localDurationSec !== "number" || !Number.isFinite(localDurationSec)) {
    return candidates[0];
  }

  const diffOf = (item: T) => {
    const d = getDurationSec(item);
    if (typeof d !== "number" || !Number.isFinite(d)) return Number.POSITIVE_INFINITY;
    return Math.abs(d - localDurationSec);
  };

  const ranked = candidates
    .map((item, index) => ({ item, index, diff: diffOf(item) }))
    .filter(x => x.diff <= toleranceSec)
    // 差升序；差相同按原始顺序（index 升序）→ 稳定取第一
    .sort((a, b) => a.diff - b.diff || a.index - b.index);

  return ranked.length ? ranked[0].item : null;
}

/**
 * 从网易候选中按时长差择优。网易 duration 为毫秒，换算成秒比较。
 * 先剔除伴奏/无人声版本与无 id 的无效候选。
 */
export function pickBestNeteaseSong(
  songs: NeteaseSong[] | undefined,
  localDurationSec: number | undefined,
  toleranceSec = DURATION_TOLERANCE_SEC,
): NeteaseSong | null {
  const candidates = (songs ?? []).filter(s => typeof s.id === "number" && !isInstrumental(s.name));
  return rankByDuration(candidates, localDurationSec, s => (s.duration ? s.duration / 1000 : undefined), toleranceSec);
}

/**
 * 从 LrcLib 候选中按时长差择优。LrcLib duration 已是秒，无需换算。
 * 先剔除：原生 instrumental 标记 / 名字含伴奏字样 / 无带时轴歌词的候选。
 */
export function pickBestLrclibSong(
  songs: SearchSongByLrclibResponse[] | undefined,
  localDurationSec: number | undefined,
  toleranceSec = DURATION_TOLERANCE_SEC,
): SearchSongByLrclibResponse | null {
  const candidates = (songs ?? []).filter(
    s => s.instrumental !== true && !isInstrumental(s.trackName) && Boolean(s.syncedLyrics?.trim()),
  );
  return rankByDuration(candidates, localDurationSec, s => s.duration, toleranceSec);
}

/** 从网易歌词响应提取原文 LRC 文本 */
function extractNeteaseLyric(res: GetLyricsByNeteaseResponse | undefined): string {
  return res?.lrc?.lyric?.trim() || res?.klyric?.lyric?.trim() || "";
}

/**
 * LrcLib 取词：搜索一次即返歌词+时长，按时长差择优，仅用带时轴的 syncedLyrics。
 * 命中返回歌词文本，未命中/异常返回 null（交由网易兜底）。
 */
async function fetchLyricFromLrclib(song: LocalMusicItem, toleranceSec: number): Promise<string | null> {
  try {
    const songs = await window.electron.searchLrclibLyrics({ q: song.title });
    const best = pickBestLrclibSong(songs, song.duration, toleranceSec);
    return best?.syncedLyrics?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * 网易取词（兜底）：搜候选 → 按时长差择优 → 二次请求拉歌词原文。
 * 命中返回歌词文本，未命中/异常返回 null。
 */
async function fetchLyricFromNetease(song: LocalMusicItem, toleranceSec: number): Promise<string | null> {
  try {
    const searchRes = await window.electron.searchNeteaseSongs({
      s: song.title,
      type: 1,
      limit: SEARCH_LIMIT,
      offset: 0,
    });
    const best = pickBestNeteaseSong(searchRes?.result?.songs, song.duration, toleranceSec);
    if (!best?.id) return null;
    const lyricRes = await window.electron.getNeteaseLyrics({ id: best.id });
    return extractNeteaseLyric(lyricRes) || null;
  } catch {
    return null;
  }
}

/** 对单首本地歌曲执行匹配流程：LrcLib 优先，网易兜底 */
async function matchOne(song: LocalMusicItem, opts: MatchOptions): Promise<MatchStatus> {
  // 1. 非覆盖模式下，已有内嵌歌词则跳过
  if (!opts.overwrite) {
    const existing = await window.electron.readLocalLyrics(song.path);
    if (existing && existing.trim()) return "skipped";
  }

  if (!song.title?.trim()) return "miss";

  // 2. LrcLib 优先 → 未命中转网易兜底
  const lyric =
    (await fetchLyricFromLrclib(song, opts.toleranceSec)) ?? (await fetchLyricFromNetease(song, opts.toleranceSec));
  if (!lyric) return "miss";

  // 3. 写回文件
  const ok = await window.electron.writeLocalLyrics(song.path, lyric);
  return ok ? "matched" : "failed";
}

/**
 * 批量自动匹配歌词 hook。
 * 对传入的歌曲列表并发匹配，已有歌词的跳过，按时长差择优写回文件。
 */
export function useBatchMatchLyrics() {
  const [progress, setProgress] = useState<BatchProgress>({ running: false, done: 0, total: 0 });
  const queueRef = useRef<PQueue | null>(null);

  const start = useCallback(async (songs: LocalMusicItem[], opts: MatchOptions): Promise<BatchResultItem[]> => {
    if (!songs.length || queueRef.current) return [];

    const counts: Record<MatchStatus, number> = { matched: 0, skipped: 0, miss: 0, failed: 0 };
    const results: BatchResultItem[] = [];
    const total = songs.length;
    let done = 0;
    setProgress({ running: true, done: 0, total });

    const queue = new PQueue({ concurrency: CONCURRENCY });
    queueRef.current = queue;

    await Promise.all(
      songs.map(song =>
        queue.add(async () => {
          let status: MatchStatus = "failed";
          try {
            status = await matchOne(song, opts);
          } catch {
            status = "failed";
          } finally {
            counts[status] += 1;
            results.push({ id: song.id, title: song.title, status });
            done += 1;
            setProgress({ running: true, done, total });
          }
        }),
      ),
    );

    queueRef.current = null;
    setProgress({ running: false, done, total });

    addToast({
      title: "歌词匹配完成",
      description: `已匹配 ${counts.matched} · 跳过 ${counts.skipped}（已有歌词）· 未命中 ${counts.miss} · 失败 ${counts.failed}`,
      color: counts.matched > 0 ? "success" : "default",
    });

    return results;
  }, []);

  return { progress, start };
}
