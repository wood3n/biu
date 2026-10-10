import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { Button } from "@heroui/react";
import {
  RiAddLine,
  RiCloseLine,
  RiContrastLine,
  RiFileMusicLine,
  RiLockUnlockLine,
  RiPauseLine,
  RiPlayLine,
  RiRefreshLine,
  RiSkipBackLine,
  RiSkipForwardLine,
  RiSubtractLine,
  RiTimeLine,
  RiTranslate2,
} from "@remixicon/react";
import { debounce } from "es-toolkit";

import type { LyricsConfidence, LyricsMatchHints, LyricsMatchResult } from "@/common/utils/lyric-match";
import type { WebPlayerParams } from "@/service/web-player";

import { matchLyricsFromPlatforms } from "@/common/utils/lyric-match";
import { findActiveLyricIndex, parseLrc, type LyricLine } from "@/common/utils/lyrics";
import IconButton from "@/components/icon-button";
import { getLyricsByBili } from "@/components/lyrics/get-lyrics";
import { defaultDesktopLyricsSettings } from "@shared/settings/desktop-lyrics-settings";
import { StoreNameMap } from "@shared/store";

import { useStyle } from "./use-style";
import { useDesktopLyricsSync } from "./use-sync";

const FONT_SIZE_STEP = 4;
const FONT_SIZE_MIN = 20;
const FONT_SIZE_MAX = 96;
const OFFSET_STEP = 500;
const OFFSET_LIMIT = 10_000;
const OPACITY_STEP = 0.1;
const OPACITY_MIN = 0.3;
const OPACITY_MAX = 1;

const TEXT_SHADOW = "0 2px 10px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.85)";

/** 与主进程保持一致的最小窗口尺寸 */
const MIN_WINDOW_WIDTH = 360;
const MIN_WINDOW_HEIGHT = 96;

type LyricsResizeEdge = "e" | "n" | "ne" | "nw" | "s" | "se" | "sw" | "w";

/** 窗口四周的拖拽改大小手柄 */
const RESIZE_HANDLES: { className: string; edge: LyricsResizeEdge }[] = [
  { className: "top-0 right-3 left-3 h-1.5 cursor-ns-resize", edge: "n" },
  { className: "right-3 bottom-0 left-3 h-1.5 cursor-ns-resize", edge: "s" },
  { className: "top-3 bottom-3 left-0 w-1.5 cursor-ew-resize", edge: "w" },
  { className: "top-3 right-0 bottom-3 w-1.5 cursor-ew-resize", edge: "e" },
  { className: "top-0 left-0 h-3 w-3 cursor-nwse-resize", edge: "nw" },
  { className: "top-0 right-0 h-3 w-3 cursor-nesw-resize", edge: "ne" },
  { className: "bottom-0 left-0 h-3 w-3 cursor-nesw-resize", edge: "sw" },
  { className: "right-0 bottom-0 h-3 w-3 cursor-nwse-resize", edge: "se" },
];

const SOURCE_TEXT: Record<LyricsSource, string> = {
  bilibili: "B 站字幕",
  lrclib: "LRCLIB",
  manual: "手动匹配",
  netease: "网易云音乐",
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const DesktopLyrics = () => {
  useStyle();

  const { lyricsRevision, sendCommand, snapshot } = useDesktopLyricsSync();
  const { currentTime, hasTrack, isPlaying } = snapshot;
  const [settings, setSettings] = useState<DesktopLyricsSettings>(defaultDesktopLyricsSettings);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [translatedLyrics, setTranslatedLyrics] = useState<LyricLine[]>([]);
  const [matchInfo, setMatchInfo] = useState<{ confidence?: LyricsConfidence; label?: string; source?: LyricsSource }>(
    {},
  );
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  /** 「换一个」时跳过前 N 个候选 */
  const skipRef = useRef(0);

  const trackKey = snapshot.bvid && snapshot.cid ? `${snapshot.bvid}-${snapshot.cid}` : "";

  const hints = useMemo<LyricsMatchHints>(
    () => ({
      artist: snapshot.artist,
      duration: snapshot.duration || undefined,
      title: snapshot.title,
    }),
    [snapshot.artist, snapshot.duration, snapshot.title],
  );

  // 读取持久化设置，并跟随主进程的锁定状态变化
  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const stored = await window.electron.getDesktopLyricsSettings();
        if (!mounted || !stored) return;

        setSettings(prev => ({ ...prev, ...stored, bounds: { ...prev.bounds, ...stored.bounds } }));
      } catch {
        // 读取失败时使用默认值
      }
    })();

    const removeLockListener = window.electron.onDesktopLyricsLockChange(locked => {
      setSettings(prev => ({ ...prev, locked }));
    });

    return () => {
      mounted = false;
      removeLockListener();
    };
  }, []);

  const persistLyrics = useCallback(
    async (patch: Partial<MusicLyrics>) => {
      if (!trackKey) return;

      try {
        const store = await window.electron.getStore(StoreNameMap.LyricsCache);
        const prev = store?.[trackKey] ?? {};

        await window.electron.setStore(StoreNameMap.LyricsCache, {
          ...(store ?? {}),
          [trackKey]: { ...prev, ...patch },
        });
      } catch {
        // 忽略缓存写入失败
      }
    },
    [trackKey],
  );

  const applyMatch = useCallback(
    (matched: LyricsMatchResult) => {
      setLyrics(parseLrc(matched.lyrics));
      setTranslatedLyrics(parseLrc(matched.tLyrics));
      setMatchInfo({ confidence: matched.confidence, label: matched.label, source: matched.source });

      void persistLyrics({
        confidence: matched.confidence,
        lyrics: matched.lyrics,
        matchLabel: matched.label,
        source: matched.source,
        tLyrics: matched.tLyrics,
      });
    },
    [persistLyrics],
  );

  /**
   * 歌词获取顺序：本地缓存 -> 音乐平台（网易云 / LRCLIB）-> B 站字幕兜底
   */
  useEffect(() => {
    let canceled = false;

    skipRef.current = 0;
    setLyrics([]);
    setTranslatedLyrics([]);
    setMatchInfo({});
    setOffset(0);

    if (!snapshot.cid) return;

    const cidAsNumber = Number(snapshot.cid);
    if (Number.isNaN(cidAsNumber)) return;

    const load = async () => {
      setIsLoading(true);

      try {
        // 1. 本地缓存（含主界面手动匹配结果）
        const store = await window.electron.getStore(StoreNameMap.LyricsCache);
        if (canceled) return;

        const cached = trackKey ? store?.[trackKey] : undefined;

        if (typeof cached?.offset === "number") {
          setOffset(cached.offset);
        }

        if (cached?.lyrics || cached?.tLyrics) {
          setLyrics(parseLrc(cached.lyrics));
          setTranslatedLyrics(parseLrc(cached.tLyrics));
          setMatchInfo({
            confidence: cached.confidence,
            label: cached.matchLabel,
            source: cached.source ?? "manual",
          });

          return;
        }

        // 2. 音乐平台自动匹配
        const matched = await matchLyricsFromPlatforms(hints);
        if (canceled) return;

        if (matched) {
          applyMatch(matched);

          return;
        }

        // 3. B 站字幕兜底（部分稿件为 ASR，质量一般）
        const params: WebPlayerParams = { cid: cidAsNumber };

        if (snapshot.bvid) params.bvid = snapshot.bvid;

        const aidAsNumber = snapshot.aid ? Number(snapshot.aid) : undefined;
        if (aidAsNumber && !Number.isNaN(aidAsNumber)) {
          params.aid = aidAsNumber;
        }

        const body = await getLyricsByBili(params);
        if (canceled) return;

        if (body?.length) {
          setLyrics(body);
          setMatchInfo({ source: "bilibili" });
        }
      } catch {
        if (!canceled) {
          setLyrics([]);
          setTranslatedLyrics([]);
        }
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      canceled = true;
    };
  }, [applyMatch, hints, lyricsRevision, snapshot.aid, snapshot.bvid, snapshot.cid, trackKey]);

  // 偏移量写回歌词缓存，与主界面歌词面板保持一致
  const persistOffset = useMemo(
    () =>
      debounce(async (key: string, value: number) => {
        if (!key) return;

        try {
          const store = await window.electron.getStore(StoreNameMap.LyricsCache);
          const prev = store?.[key] ?? {};

          await window.electron.setStore(StoreNameMap.LyricsCache, {
            ...(store ?? {}),
            [key]: { ...prev, offset: value },
          });
        } catch {
          // 忽略缓存写入失败
        }
      }, 400),
    [],
  );

  useEffect(() => {
    return () => {
      const cancelable = persistOffset as { cancel?: () => void };
      cancelable.cancel?.();
    };
  }, [persistOffset]);

  const updateStyle = useCallback((patch: Partial<DesktopLyricsStyle>) => {
    setSettings(prev => ({ ...prev, ...patch }));
    void window.electron.updateDesktopLyricsStyle(patch);
  }, []);

  const changeOffset = useCallback(
    (next: number) => {
      const value = clamp(next, -OFFSET_LIMIT, OFFSET_LIMIT);
      setOffset(value);
      void persistOffset(trackKey, value);
    },
    [persistOffset, trackKey],
  );

  /** 换一个：跳过当前候选，继续找下一首同名歌曲的歌词 */
  const rematch = useCallback(async () => {
    if (!snapshot.cid || isLoading) return;

    skipRef.current += 1;
    setIsLoading(true);

    try {
      const matched = await matchLyricsFromPlatforms(hints, { skip: skipRef.current });

      if (matched) {
        applyMatch(matched);
      } else {
        skipRef.current = 0;
      }
    } catch {
      skipRef.current = 0;
    } finally {
      setIsLoading(false);
    }
  }, [applyMatch, hints, isLoading, snapshot.cid]);

  const currentMs = currentTime * 1000 + offset;

  const activeIndex = useMemo(() => findActiveLyricIndex(lyrics, currentMs), [currentMs, lyrics]);

  const translationMap = useMemo(() => {
    const map = new Map<number, string>();

    translatedLyrics.forEach(item => {
      map.set(item.time, item.text);
    });

    return map;
  }, [translatedLyrics]);

  const lineIndex = activeIndex >= 0 ? activeIndex : 0;
  const currentLine = lyrics[lineIndex];
  const previousLine = lineIndex > 0 ? lyrics[lineIndex - 1] : undefined;
  const nextLine = lyrics[lineIndex + 1];

  const { background, fontSize, locked, opacity, showTranslation } = settings;

  const toggleLock = useCallback(() => {
    const next = !locked;
    setSettings(prev => ({ ...prev, locked: next }));
    window.electron.setDesktopLyricsLocked(next);
  }, [locked]);

  const unlock = useCallback(() => {
    setSettings(prev => ({ ...prev, locked: false }));
    window.electron.setDesktopLyricsLocked(false);
  }, []);

  // hover 状态由主进程轮询光标位置给出：整窗是拖拽区域，渲染层收不到 mouseenter
  useEffect(() => {
    const removeHoverListener = window.electron.onDesktopLyricsHoverChange(hovered => setIsHovered(hovered));

    return () => {
      removeHoverListener();
    };
  }, []);

  // 拖拽窗口边缘改变大小：监听先挂上（避免等 IPC 返回时丢掉最先几个事件），起点取 pointerdown 的屏幕坐标
  const handleResizeStart = useCallback((edge: LyricsResizeEdge, event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startPointer = { x: event.screenX, y: event.screenY };
    let startBounds: { height: number; width: number; x: number; y: number } | undefined;
    let latestPointer = startPointer;

    const apply = () => {
      if (!startBounds) return;

      const dx = latestPointer.x - startPointer.x;
      const dy = latestPointer.y - startPointer.y;
      const next = { ...startBounds };

      if (edge.includes("e")) next.width = startBounds.width + dx;
      if (edge.includes("s")) next.height = startBounds.height + dy;
      if (edge.includes("w")) {
        next.width = Math.max(MIN_WINDOW_WIDTH, startBounds.width - dx);
        next.x = startBounds.x + (startBounds.width - next.width);
      }
      if (edge.includes("n")) {
        next.height = Math.max(MIN_WINDOW_HEIGHT, startBounds.height - dy);
        next.y = startBounds.y + (startBounds.height - next.height);
      }

      window.electron.setDesktopLyricsBounds(next);
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      latestPointer = { x: moveEvent.screenX, y: moveEvent.screenY };
      apply();
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    void window.electron.getDesktopLyricsBounds().then(bounds => {
      startBounds = bounds;
      apply();
    });
  }, []);

  const sourceLabel = matchInfo.source ? SOURCE_TEXT[matchInfo.source] : "";

  return (
    <div
      className={`${locked ? "window-no-drag" : "window-drag"} relative flex h-screen w-screen items-center justify-center overflow-hidden select-none`}
      style={{ opacity }}
    >
      {background ? <div className="absolute inset-2 rounded-2xl bg-black/45 backdrop-blur-md" /> : null}

      <div className="relative z-10 flex w-full flex-col items-center gap-1 px-10 text-center">
        {!hasTrack ? (
          <p className="text-base font-medium text-white/70" style={{ textShadow: TEXT_SHADOW }}>
            暂无播放内容 · 在 Biu 中播放歌曲后歌词会显示在这里
          </p>
        ) : lyrics.length ? (
          <>
            <p
              className="max-w-full truncate text-white/40"
              style={{ fontSize: Math.round(fontSize * 0.58), textShadow: TEXT_SHADOW }}
            >
              {previousLine?.text ?? "\u00A0"}
            </p>
            <p
              className="text-primary max-w-full font-extrabold break-words whitespace-pre-wrap"
              style={{ fontSize, lineHeight: 1.25, textShadow: TEXT_SHADOW }}
            >
              {currentLine?.text ?? ""}
            </p>
            {showTranslation && currentLine && translationMap.get(currentLine.time) ? (
              <p
                className="max-w-full text-white/75"
                style={{ fontSize: Math.round(fontSize * 0.5), textShadow: TEXT_SHADOW }}
              >
                {translationMap.get(currentLine.time)}
              </p>
            ) : null}
            <p
              className="max-w-full truncate text-white/55"
              style={{ fontSize: Math.round(fontSize * 0.58), textShadow: TEXT_SHADOW }}
            >
              {nextLine?.text ?? "\u00A0"}
            </p>
          </>
        ) : (
          <p className="text-base font-medium text-white/70" style={{ textShadow: TEXT_SHADOW }}>
            {isLoading ? "歌词匹配中..." : "暂无歌词 · 点右上角「选歌词」手动匹配，或「换一个」换首同名歌曲"}
          </p>
        )}
      </div>

      {sourceLabel ? (
        <div className="pointer-events-none absolute bottom-1 left-3 z-10 text-[10px] text-white/35">
          {sourceLabel}
          {matchInfo.confidence && matchInfo.confidence !== "strong" ? "（疑似匹配）" : ""}
          {matchInfo.label ? ` · ${matchInfo.label}` : ""}
        </div>
      ) : null}

      {!locked && isHovered ? (
        <div className="window-no-drag absolute top-2 right-2 z-20 flex items-center gap-0.5 rounded-full bg-black/45 px-2 py-1 backdrop-blur-md">
          <IconButton
            aria-label="上一首"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="上一首"
            variant="light"
            onPress={() => sendCommand("prev")}
          >
            <RiSkipBackLine size={16} />
          </IconButton>

          <IconButton
            aria-label="播放/暂停"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip={isPlaying ? "暂停" : "播放"}
            variant="light"
            onPress={() => sendCommand("togglePlay")}
          >
            {isPlaying ? <RiPauseLine size={16} /> : <RiPlayLine size={16} />}
          </IconButton>

          <IconButton
            aria-label="下一首"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="下一首"
            variant="light"
            onPress={() => sendCommand("next")}
          >
            <RiSkipForwardLine size={16} />
          </IconButton>

          <IconButton
            aria-label="选歌词"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="选歌词（在主界面搜索并手动匹配）"
            variant="light"
            onPress={() => sendCommand("openLyricsSearch")}
          >
            <RiFileMusicLine size={16} />
          </IconButton>

          <IconButton
            aria-label="换一个匹配"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="换一个匹配（下一首同名歌曲）"
            variant="light"
            onPress={() => void rematch()}
          >
            <RiRefreshLine size={16} />
          </IconButton>

          <IconButton
            aria-label="减小字号"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="减小字号"
            variant="light"
            onPress={() => updateStyle({ fontSize: clamp(fontSize - FONT_SIZE_STEP, FONT_SIZE_MIN, FONT_SIZE_MAX) })}
          >
            <RiSubtractLine size={16} />
          </IconButton>
          <IconButton
            aria-label="增大字号"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="增大字号"
            variant="light"
            onPress={() => updateStyle({ fontSize: clamp(fontSize + FONT_SIZE_STEP, FONT_SIZE_MIN, FONT_SIZE_MAX) })}
          >
            <RiAddLine size={16} />
          </IconButton>

          <IconButton
            aria-label="歌词提前 0.5 秒"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="歌词提前 0.5 秒"
            variant="light"
            onPress={() => changeOffset(offset - OFFSET_STEP)}
          >
            <RiTimeLine size={16} className="-scale-x-100" />
          </IconButton>
          <IconButton
            aria-label="歌词延后 0.5 秒"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="歌词延后 0.5 秒"
            variant="light"
            onPress={() => changeOffset(offset + OFFSET_STEP)}
          >
            <RiTimeLine size={16} />
          </IconButton>

          <IconButton
            aria-label="降低不透明度"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="降低不透明度"
            variant="light"
            onPress={() =>
              updateStyle({ opacity: clamp(Number((opacity - OPACITY_STEP).toFixed(2)), OPACITY_MIN, OPACITY_MAX) })
            }
          >
            <RiContrastLine size={16} />
          </IconButton>
          <IconButton
            aria-label="提高不透明度"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="提高不透明度"
            variant="light"
            onPress={() =>
              updateStyle({ opacity: clamp(Number((opacity + OPACITY_STEP).toFixed(2)), OPACITY_MIN, OPACITY_MAX) })
            }
          >
            <RiContrastLine size={16} className="rotate-180" />
          </IconButton>

          <Button
            aria-label="显示翻译"
            className={`min-w-0 px-2 text-xs ${showTranslation ? "text-primary" : "text-white/70"}`}
            size="sm"
            variant="light"
            onPress={() => updateStyle({ showTranslation: !showTranslation })}
          >
            <RiTranslate2 size={14} />
          </Button>
          <Button
            aria-label="显示背景"
            className={`min-w-0 px-2 text-xs ${background ? "text-primary" : "text-white/70"}`}
            size="sm"
            variant="light"
            onPress={() => updateStyle({ background: !background })}
          >
            背景
          </Button>

          <IconButton
            aria-label="锁定（鼠标穿透）"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="锁定（鼠标穿透）"
            variant="light"
            onPress={toggleLock}
          >
            <RiLockUnlockLine size={16} />
          </IconButton>

          <IconButton
            aria-label="关闭桌面歌词"
            className="min-w-0 text-white/80"
            size="sm"
            tooltip="关闭桌面歌词"
            variant="light"
            onPress={() => window.electron.closeDesktopLyrics()}
          >
            <RiCloseLine size={16} />
          </IconButton>
        </div>
      ) : null}

      {/* 锁定时默认鼠标穿透（点击留给下面的内容）；鼠标移进歌词框就露出这个解锁按钮，
          光标落到它上面时主进程会临时放行鼠标事件，所以点得到 */}
      {locked && isHovered ? (
        <button
          aria-label="解锁桌面歌词"
          className="window-no-drag absolute top-1.5 right-1.5 z-40 flex h-7 cursor-pointer items-center gap-1 rounded-full bg-black/60 px-2.5 text-xs text-white/90 backdrop-blur-md hover:bg-black/80"
          title="解锁桌面歌词"
          type="button"
          onClick={unlock}
        >
          <RiLockUnlockLine size={14} />
          解锁
        </button>
      ) : null}

      {/* 拖拽边缘改变窗口大小（未锁定时悬停出现） */}
      {!locked && isHovered
        ? RESIZE_HANDLES.map(handle => (
            <div
              key={handle.edge}
              className={`window-no-drag absolute z-30 ${handle.className}`}
              data-resize-edge={handle.edge}
              onPointerDown={event => handleResizeStart(handle.edge, event)}
            />
          ))
        : null}
    </div>
  );
};

export default DesktopLyrics;
