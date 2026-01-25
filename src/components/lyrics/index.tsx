import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { addToast, useDisclosure } from "@heroui/react";
import { RiTBoxLine, RiEditLine } from "@remixicon/react";
import clsx from "classnames";
import { debounce } from "es-toolkit";

import type { WebPlayerParams } from "@/service/web-player";

import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";
import { useFullScreenPlayerSettings } from "@/store/full-screen-player-settings";
import { StoreNameMap } from "@shared/store";

import IconButton from "../icon-button";
import LyricsSearchModal from "../lyrics-search-modal";
import LyricsEditModal from "./edit-modal";
import FontSizeControl from "./font-size-control";
import { getLyricsByBili } from "./get-lyrics";
import OffsetControl from "./offset-control";

type LyricLine = {
  time: number; // milliseconds
  text: string;
};

type PlayItem = ReturnType<ReturnType<typeof usePlayList.getState>["getPlayItem"]>;

const activeTextBase = "text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]";

const timeTagPattern = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

const DEFAULT_FONT_SIZE = 20;
const DEFAULT_OFFSET = 0;

// 将毫秒时间转换为LRC格式的时间标签
const formatTime = (timeMs: number): string => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeMs % 1000) / 10);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMilliseconds = String(milliseconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
};

const Lyrics = ({ color, centered, showControls }: { color?: string; centered?: boolean; showControls?: boolean }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [centerPadding, setCenterPadding] = useState(0);
  const playId = usePlayList(s => s.playId);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [translatedLyrics, setTranslatedLyrics] = useState<LyricLine[]>([]);
  const [offset, setOffset] = useState<number>(DEFAULT_OFFSET);
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const { currentTime } = usePlayProgress();
  const currentMs = currentTime * 1000 + offset;

  const showLyricsTranslation = useFullScreenPlayerSettings(s => s.showLyricsTranslation);

  const {
    isOpen: isSearchOpen,
    onOpen: onOpenSearch,
    onClose: onCloseSearch,
    onOpenChange: setIsSearchOpen,
  } = useDisclosure();

  const {
    isOpen: isEditOpen,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
    onOpenChange: setIsEditOpen,
  } = useDisclosure();

  const parseLrc = useCallback((raw?: string | null) => {
    if (!raw) return [] as LyricLine[];

    const result: LyricLine[] = [];
    const lines = raw.split(/\r?\n/);

    lines.forEach(line => {
      const text = line.replace(timeTagPattern, "").trim();
      if (!text) return;

      let match: RegExpExecArray | null;
      while ((match = timeTagPattern.exec(line)) !== null) {
        const minutes = Number(match[1]);
        const seconds = Number(match[2]);
        const millis = match[3] ? Number(match[3].padEnd(3, "0")) : 0;

        if (Number.isNaN(minutes) || Number.isNaN(seconds) || Number.isNaN(millis)) continue;

        const time = Math.max(0, minutes * 60 * 1000 + seconds * 1000 + millis);
        result.push({ time, text });
      }

      timeTagPattern.lastIndex = 0;
    });

    return result.toSorted((a, b) => a.time - b.time);
  }, []);

  const tryLoadCachedLyrics = useCallback(async () => {
    const playItem = usePlayList.getState().getPlayItem();
    if (!playItem?.bvid || !playItem?.cid) return null;

    const store = await window.electron.getStore(StoreNameMap.LyricsCache);
    if (!store || typeof store !== "object") return null;

    return store[`${playItem.bvid}-${playItem.cid}`] ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playId]);

  useEffect(() => {
    let canceled = false;
    setOffset(DEFAULT_OFFSET);
    setFontSize(DEFAULT_FONT_SIZE);

    const playItem = usePlayList.getState().getPlayItem();
    const fetchLyrics = async () => {
      if (!playItem?.cid) {
        setLyrics([]);
        setTranslatedLyrics([]);
        setIsLoading(false);
        return;
      }

      const cidAsNumber = Number(playItem.cid);
      if (Number.isNaN(cidAsNumber)) {
        setLyrics([]);
        setTranslatedLyrics([]);
        return;
      }

      setIsLoading(true);

      try {
        const cached = await tryLoadCachedLyrics();
        if (canceled) return;

        if (cached) {
          setOffset(typeof cached.offset === "number" ? cached.offset : DEFAULT_OFFSET);
          setFontSize(typeof cached.fontSize === "number" ? cached.fontSize : DEFAULT_FONT_SIZE);
          const hasLyrics = Boolean(cached.lyrics);
          const hasTranslated = Boolean(cached.tLyrics);
          if (hasLyrics || hasTranslated) {
            setLyrics(parseLrc(cached.lyrics || undefined));
            setTranslatedLyrics(parseLrc(cached.tLyrics || undefined));
            return;
          }
        }

        const params: WebPlayerParams = { cid: cidAsNumber };

        if (playItem.bvid) params.bvid = playItem.bvid;

        const aidAsNumber = playItem.aid ? Number(playItem.aid) : undefined;
        if (aidAsNumber && !Number.isNaN(aidAsNumber)) {
          params.aid = aidAsNumber;
        }

        const body = await getLyricsByBili(params);

        if (canceled) return;

        if (!body?.length) {
          setLyrics([]);
          setTranslatedLyrics([]);
          return;
        }

        setLyrics(body);
        setTranslatedLyrics([]);
      } catch {
        if (canceled) return;
        setLyrics([]);
        setTranslatedLyrics([]);
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    };

    void fetchLyrics();

    return () => {
      canceled = true;
    };
  }, [parseLrc, playId, tryLoadCachedLyrics]);

  const translationMap = useMemo(() => {
    if (!translatedLyrics || !Array.isArray(translatedLyrics) || !translatedLyrics.length) return new Map<number, string>();
    const map = new Map<number, string>();
    translatedLyrics.forEach(item => {
      if (item && typeof item === 'object' && 'time' in item && 'text' in item) {
        map.set(item.time, item.text);
      }
    });
    return map;
  }, [translatedLyrics]);

  const activeIndex = useMemo(() => {
    if (!lyrics || !Array.isArray(lyrics) || !lyrics.length) return -1;
    for (let i = lyrics.length - 1; i >= 0; i -= 1) {
      if (currentMs >= lyrics[i].time) return i;
    }
    return 0;
  }, [currentMs, lyrics]);

  const persistLyricsCache = useMemo(
    () =>
      debounce(async (playItem: PlayItem, nextOffset?: number, nextFontSize?: number, nextLyrics?: string, nextTLyrics?: string) => {
        try {
          if (!playItem?.bvid || !playItem?.cid) return;
          const store = await window.electron.getStore(StoreNameMap.LyricsCache);
          const key = `${playItem.bvid}-${playItem.cid}`;
          const prev = store?.[key] || {};

          await window.electron.setStore(StoreNameMap.LyricsCache, {
            ...(store || {}),
            [key]: {
              ...prev,
              offset: nextOffset ?? 0,
              fontSize: nextFontSize ?? 0,
              lyrics: nextLyrics,
              tLyrics: nextTLyrics,
            },
          });
        } catch {
          addToast({ color: "danger", title: "保存失败" });
        }
      }, 500),
    [],
  );

  const handleOffsetChange = useCallback(
    (next: number) => {
      setOffset(next);

      const playItem = usePlayList.getState().getPlayItem();
      const cid = playItem?.cid ? Number(playItem.cid) : undefined;
      if (!playItem?.bvid || cid === undefined || Number.isNaN(cid)) return;

      persistLyricsCache(playItem, next, fontSize);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fontSize, persistLyricsCache, playId],
  );

  const handleFontSizeChange = useCallback(
    (next: number) => {
      setFontSize(next);

      const playItem = usePlayList.getState().getPlayItem();
      const cid = playItem?.cid ? Number(playItem.cid) : undefined;
      if (!playItem?.bvid || cid === undefined || Number.isNaN(cid)) return;

      persistLyricsCache(playItem, offset, next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offset, persistLyricsCache, playId],
  );

  const updateCenterPadding = useCallback(() => {
    if (activeIndex < 0) {
      setCenterPadding(0);
      return;
    }

    const measure = () => {
      const containerHeight = containerRef.current?.clientHeight ?? 0;
      const lineHeight = lineRefs.current[activeIndex]?.clientHeight ?? 0;
      if (containerHeight > 0 && lineHeight > 0) {
        const padding = Math.max(0, containerHeight / 2 - lineHeight / 2);
        setCenterPadding(padding);
        return true;
      }
      return false;
    };

    if (!measure()) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        void measure();
      });
    }
  }, [activeIndex]);

  const handleLyricsAdopted = useCallback(
    (nextLyrics?: string, nextTLyrics?: string) => {
      onCloseSearch();
      if (nextLyrics) {
        setLyrics(parseLrc(nextLyrics));
        setTranslatedLyrics(nextTLyrics ? parseLrc(nextTLyrics) : []);
      }
    },
    [onCloseSearch, parseLrc],
  );

  const handleLyricsSaved = useCallback(
    (editedLyrics: string, editedTranslatedLyrics?: string) => {
      setLyrics(parseLrc(editedLyrics));
      setTranslatedLyrics(editedTranslatedLyrics ? parseLrc(editedTranslatedLyrics) : []);

      // 保存到缓存
      const playItem = usePlayList.getState().getPlayItem();
      if (playItem?.bvid && playItem?.cid) {
        persistLyricsCache(playItem, offset, fontSize, editedLyrics, editedTranslatedLyrics);
      }

      onCloseEdit();
    },
    [onCloseEdit, offset, fontSize, parseLrc, persistLyricsCache]
  );

  useEffect(() => {
    return () => {
      const cancelable = persistLyricsCache as { cancel?: () => void };
      cancelable.cancel?.();
    };
  }, [persistLyricsCache]);

  useEffect(() => {
    updateCenterPadding();
  }, [updateCenterPadding, fontSize, lyrics.length]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [activeIndex]);

  useEffect(() => {
    const handleResize = () => updateCenterPadding();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCenterPadding]);

  useEffect(() => {
    const wrapper = containerRef.current;

    if (activeIndex < 0) return;

    const el = lineRefs.current[activeIndex];
    if (el && wrapper) {
      const top = el.offsetTop - wrapper.clientHeight / 2 + el.clientHeight / 2;
      wrapper.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, [activeIndex, centerPadding]);

  const renderLine = (line: LyricLine, index: number) => {
    const isActive = index === activeIndex;
    const translation = translationMap.get(line.time);
    const activeWeight = isActive ? "font-extrabold" : "font-normal";
    const activeShadow = isActive ? activeTextBase : "";

    return (
      <div
        key={`${line.time}-${index}`}
        ref={node => {
          lineRefs.current[index] = node;
        }}
        className={clsx(
          "w-full transform-none py-2 transition-all duration-300 ease-out",
          centered ? "text-center" : "text-left",
          isActive ? "opacity-100" : "opacity-60",
        )}
        style={{ fontSize: isActive ? fontSize * 1.5 : fontSize, transform: "none" }}
      >
        <div
          className={clsx("leading-snug break-words whitespace-pre-wrap", activeWeight, activeShadow)}
          style={{ color: color || undefined }}
        >
          {line.text || ''}
        </div>
        {translation && showLyricsTranslation ? (
          <div className="mt-1 text-sm break-words whitespace-pre-wrap text-white/80">{translation}</div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <div className="group/lyrics relative flex h-full w-full items-center justify-center overflow-hidden">
        <div
          ref={containerRef}
          className="no-scrollbar relative h-full w-full max-w-4xl overflow-y-auto"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.15) 6%, rgba(0,0,0,0.5) 12%, black 24%, black 76%, rgba(0,0,0,0.5) 88%, rgba(0,0,0,0.15) 94%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.15) 6%, rgba(0,0,0,0.5) 12%, black 24%, black 76%, rgba(0,0,0,0.5) 88%, rgba(0,0,0,0.15) 94%, transparent 100%)",
          }}
        >
          {lyrics && Array.isArray(lyrics) && lyrics.length ? (
            <div
              className="space-y-2"
              style={{
                paddingTop: centerPadding,
                paddingBottom: centerPadding,
              }}
            >
              {lyrics.map((line, index) => renderLine(line, index))}
            </div>
          ) : (
            <div className="text-foreground/70 flex h-full items-center justify-center">
              {isLoading ? "歌词加载中..." : "暂无歌词"}
            </div>
          )}
        </div>

        {showControls && (
          <div className="text-foreground/80 pointer-events-none absolute right-6 bottom-6 flex flex-col items-center space-y-3 text-sm transition-opacity duration-200">
            <div className="pointer-events-auto">
              <FontSizeControl value={fontSize} onChange={handleFontSizeChange} onOpenChange={() => {}} />
            </div>
            <div className="pointer-events-auto">
              <OffsetControl value={offset} onChange={handleOffsetChange} onOpenChange={() => {}} />
            </div>
            <div className="pointer-events-auto">
              <IconButton
                type="button"
                onPress={onOpenSearch}
                className="bg-foreground/20 text-foreground hover:bg-foreground/30 min-w-0 rounded-full text-xs font-semibold"
              >
                <RiTBoxLine size={16} />
              </IconButton>
            </div>
            <div className="pointer-events-auto">
              <IconButton
                type="button"
                onPress={onOpenEdit}
                className="bg-foreground/20 text-foreground hover:bg-foreground/30 min-w-0 rounded-full text-xs font-semibold"
              >
                <RiEditLine size={16} />
              </IconButton>
            </div>
          </div>
        )}
      </div>
      <LyricsSearchModal isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} onLyricsAdopted={handleLyricsAdopted} />
      <LyricsEditModal
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        lyrics={lyrics && Array.isArray(lyrics) ? lyrics.map(l => `[${formatTime(l.time)}]${l.text}`).join('\n') : ''}
        translatedLyrics={translatedLyrics && Array.isArray(translatedLyrics) ? translatedLyrics.map(l => `[${formatTime(l.time)}]${l.text}`).join('\n') : ''}
        onSave={handleLyricsSaved}
      />
    </>
  );
};

export default Lyrics;
