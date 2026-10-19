import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { addToast, useDisclosure } from "@heroui/react";
import { RiTBoxLine } from "@remixicon/react";
import clsx from "classnames";
import { debounce } from "es-toolkit";
import { useShallow } from "zustand/react/shallow";

import { getActiveLyricIndex, getLyricsCacheKey, useLyricsStore } from "@/store/lyrics";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";
import { StoreNameMap } from "@shared/store";

import IconButton from "../icon-button";
import LyricsSearchModal from "../lyrics-search-modal";
import FontSizeControl from "./font-size-control";
import OffsetControl from "./offset-control";

type PlayItem = ReturnType<ReturnType<typeof usePlayList.getState>["getPlayItem"]>;

const activeTextBase = "text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]";

const DEFAULT_FONT_SIZE = 20;

const Lyrics = ({ color, centered, showControls }: { color?: string; centered?: boolean; showControls?: boolean }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [centerPadding, setCenterPadding] = useState(0);
  const playId = usePlayList(s => s.playId);
  const { lyrics, translatedLyrics, offset, isLoading, isLoaded } = useLyricsStore(
    useShallow(s => ({
      lyrics: s.lyrics,
      translatedLyrics: s.translatedLyrics,
      offset: s.offset,
      isLoading: s.isLoading,
      isLoaded: s.isLoaded,
    })),
  );
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const currentTime = usePlayProgress(s => s.currentTime);
  const currentMs = currentTime * 1000 + offset;

  const {
    isOpen: isSearchOpen,
    onOpen: onOpenSearch,
    onClose: onCloseSearch,
    onOpenChange: setIsSearchOpen,
  } = useDisclosure();

  useEffect(() => {
    let canceled = false;
    setFontSize(DEFAULT_FONT_SIZE);

    const restoreLyricSettings = async () => {
      const playItem = usePlayList.getState().getPlayItem();
      const cacheKey = getLyricsCacheKey(playItem?.bvid, playItem?.cid);
      if (!cacheKey) return;

      try {
        const store = await window.electron.getStore(StoreNameMap.LyricsCache);
        const cached = store?.[cacheKey];
        if (canceled || !cached) return;

        setFontSize(typeof cached.fontSize === "number" ? cached.fontSize : DEFAULT_FONT_SIZE);
      } catch {
        // 缓存读取失败时使用默认值
      }
    };

    void restoreLyricSettings();
    // 歌词内容与偏移量由全局 store 统一加载，顶部歌词栏与全屏播放器共用
    void useLyricsStore.getState().load();

    return () => {
      canceled = true;
    };
  }, [playId]);

  const translationMap = useMemo(() => {
    if (!translatedLyrics?.length) return new Map<number, string>();
    const map = new Map<number, string>();
    translatedLyrics.forEach(item => {
      map.set(item.time, item.text);
    });
    return map;
  }, [translatedLyrics]);

  const activeIndex = useMemo(() => {
    const found = getActiveLyricIndex(lyrics, currentMs);
    if (found >= 0) return found;
    return lyrics.length ? 0 : -1;
  }, [currentMs, lyrics]);

  const persistLyricsCache = useMemo(
    () =>
      debounce(async (playItem: PlayItem, nextOffset?: number, nextFontSize?: number) => {
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
            },
          });
        } catch {
          addToast({ color: "danger", title: "保存失败" });
        }
      }, 500),
    [],
  );

  /** 调整歌词偏移量：写入共享 store，让顶部歌词栏/桌面歌词同步生效，并持久化到缓存 */
  const handleOffsetChange = useCallback(
    (next: number) => {
      useLyricsStore.getState().setOffset(next);

      const playItem = usePlayList.getState().getPlayItem();
      const cid = playItem?.cid ? Number(playItem.cid) : undefined;
      if (!playItem?.bvid || cid === undefined || Number.isNaN(cid)) return;

      persistLyricsCache(playItem, next, fontSize);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fontSize, persistLyricsCache, playId],
  );

  /** 调整全屏播放器歌词字号（仅影响全屏播放器，持久化到缓存） */
  const handleFontSizeChange = useCallback(
    (next: number) => {
      setFontSize(next);

      const playItem = usePlayList.getState().getPlayItem();
      const cid = playItem?.cid ? Number(playItem.cid) : undefined;
      if (!playItem?.bvid || cid === undefined || Number.isNaN(cid)) return;

      persistLyricsCache(playItem, useLyricsStore.getState().offset, next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [persistLyricsCache, playId],
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
        useLyricsStore.getState().applyLyrics(nextLyrics, nextTLyrics);
      }
    },
    [onCloseSearch],
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
          {line.text}
        </div>
        {translation ? (
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
          {lyrics.length ? (
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
              {isLoading || !isLoaded ? "歌词加载中..." : "暂无歌词"}
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
          </div>
        )}
      </div>
      <LyricsSearchModal isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} onLyricsAdopted={handleLyricsAdopted} />
    </>
  );
};

export default Lyrics;
