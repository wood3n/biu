import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Button, Slider } from "@heroui/react";
import {
  RiExpandDiagonalLine,
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "@remixicon/react";
import clx from "classnames";
import { useShallow } from "zustand/react/shallow";

import type { WebPlayerParams } from "@/service/web-player";

import { getPlayModeList } from "@/common/constants/audio";
import { createBroadcastChannel, toggleMiniMode } from "@/common/utils/mini-player";
import Image from "@/components/image";
import { getLyricsAuto, parseLrcToLines } from "@/components/lyrics/get-lyrics";
import { usePlayProgress } from "@/store/play-progress";
import { StoreNameMap } from "@shared/store";

import { usePlayState } from "./play-state";
import { useStyle } from "./use-style";

const PlayModeList = getPlayModeList(16);

const COVER_WIDTH = 67;

/**
 * 条件滚动文字：文字宽度 > 容器宽度时无缝滚动，否则居中静止。
 * 溢出时渲染双份文字 + marquee-scroll（translateX(-50%)）实现无缝循环。
 * 文字内容变化时重新测量。
 */
const MarqueeText = memo(({ text, className }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  // 溢出时先静止展示 1 秒再开始滚动
  const [canScroll, setCanScroll] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const measure = () => {
      const containerWidth = container.clientWidth;
      const textWidth = textEl.scrollWidth;
      setShouldScroll(textWidth > containerWidth);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(textEl);
    return () => ro.disconnect();
  }, [text, shouldScroll]);

  // 文字变化时重置延迟，1 秒后允许滚动
  useEffect(() => {
    if (!shouldScroll) {
      setCanScroll(false);
      return;
    }
    setCanScroll(false);
    const timer = setTimeout(() => setCanScroll(true), 1000);
    return () => clearTimeout(timer);
  }, [text, shouldScroll]);

  if (shouldScroll) {
    const separator = "\u00A0\u00A0\u00A0";
    return (
      <div ref={containerRef} className="overflow-hidden">
        <div className={clx("flex w-max", canScroll && "animate-[marquee-scroll_8s_linear_infinite]")}>
          <span ref={textRef} className={className}>
            {text}
          </span>
          <span className={className} aria-hidden>
            {separator}
          </span>
          <span className={className} aria-hidden>
            {text}
          </span>
          <span className={className} aria-hidden>
            {separator}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex justify-center overflow-hidden">
      <span ref={textRef} className={className}>
        {text}
      </span>
    </div>
  );
});

const CoverView = memo(() => {
  const cover = usePlayState(s => s.cover);
  if (!cover) return null;
  return (
    <div className="relative h-full flex-shrink-0" style={{ width: COVER_WIDTH }}>
      <Image
        removeWrapper
        radius="none"
        src={cover}
        width={COVER_WIDTH}
        height="100%"
        params="672w_378h_1c.avif"
        loading="eager"
        decoding="async"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden", willChange: "transform", contain: "paint" }}
      />
    </div>
  );
});

// 默认显示：滚动歌词（当前行）
// hover 时显示：歌名 - 歌手（滚动）
const InfoView = memo(
  ({
    title,
    ownerName,
    lyrics,
    activeLyricIndex,
    isHovered,
  }: {
    title?: string;
    ownerName?: string;
    lyrics: LyricLine[];
    activeLyricIndex: number;
    isHovered: boolean;
  }) => {
    const textStyle = "text-center text-xs font-medium whitespace-nowrap";

    // hover 且有歌词 → 显示 歌名 - 歌手
    if (isHovered) {
      if (!title) return <span className="truncate text-center text-xs text-zinc-500">暂无播放内容</span>;
      const text = ownerName ? `${title} - ${ownerName}` : title;
      return <MarqueeText text={text} className={textStyle} />;
    }

    // 默认：显示当前歌词行
    if (lyrics.length > 0 && activeLyricIndex >= 0) {
      const lyric = lyrics[activeLyricIndex]?.text;
      if (lyric) {
        return <MarqueeText text={lyric} className={textStyle} />;
      }
    }

    // 无歌词时 fallback 显示歌名
    if (!title) return <span className="truncate text-center text-xs text-zinc-500">暂无播放内容</span>;
    return <span className="truncate text-center text-xs font-medium">{title}</span>;
  },
);

const MiniPlayer = () => {
  const { isSingle, isPlaying, title, duration, playMode, ownerName } = usePlayState(
    useShallow(state => ({
      isSingle: state.isSingle,
      isPlaying: state.isPlaying,
      title: state.title,
      duration: state.duration,
      playMode: state.playMode,
      ownerName: state.ownerName,
    })),
  );
  const lyrics = usePlayState(s => s.lyrics);
  const [isHovered, setIsHovered] = useState(false);
  const seekingTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const currentTime = usePlayProgress(s => s.currentTime);
  const setCurrentTime = usePlayProgress(s => s.setCurrentTime);
  const updatePlayState = usePlayState(state => state.update);
  const bcRef = useRef<BroadcastChannel>(null);

  // 歌词加载去重：同一 bvid+cid 只拉一次
  const loadedLyricsKeyRef = useRef<string>("");
  const lyricsLoadingRef = useRef<boolean>(false);

  const postMessage = (type: string, state?: any) => {
    if (!bcRef.current) return;
    bcRef.current.postMessage({
      from: "mini",
      data: {
        type,
        state,
      },
      ts: Date.now(),
    });
  };

  useStyle();

  const playModeIcon = useMemo(() => {
    return PlayModeList.find(item => item.value === playMode)?.icon;
  }, [playMode]);

  // 异步加载歌词（去重：同一 bvid+cid 只拉一次）
  const loadLyrics = async (bvid: string, cid: string, songTitle: string) => {
    const key = `${bvid}-${cid}`;
    if (loadedLyricsKeyRef.current === key) return;
    if (lyricsLoadingRef.current) return;
    loadedLyricsKeyRef.current = key;
    lyricsLoadingRef.current = true;

    try {
      const store = await window.electron.getStore(StoreNameMap.LyricsCache);
      const cached = store?.[key]?.lyrics;
      let lines = parseLrcToLines(cached);

      if (!lines.length) {
        const params: WebPlayerParams = { cid: Number(cid) };
        if (bvid) params.bvid = bvid;
        const result = await getLyricsAuto(params, songTitle || "", bvid, cid);
        if (result?.lyrics.length) lines = result.lyrics;
      }

      if (lines.length) {
        usePlayState.getState().update({ ...usePlayState.getState(), lyrics: lines });
      }
    } catch {
      // 静默失败
    } finally {
      lyricsLoadingRef.current = false;
    }
  };

  useEffect(() => {
    bcRef.current = createBroadcastChannel();
    postMessage("init");

    bcRef.current.onmessage = ev => {
      const { from, state } = ev.data || {};
      if (from !== "main" || !state) return;

      // 1. 拖动进度条时跳过主窗口推送的 currentTime，避免覆盖用户拖动位置
      if (typeof state.currentTime === "number" && !isSeekingRef.current) {
        setCurrentTime(state.currentTime);
      }

      // 2. 更新 play-state（isPlaying, title, cover 等）
      updatePlayState(state);

      // 3. 歌词去重加载：仅当 bvid/cid 变化时触发
      if (state.bvid && state.cid) {
        const key = `${state.bvid}-${state.cid}`;
        if (loadedLyricsKeyRef.current !== key && !lyricsLoadingRef.current) {
          void loadLyrics(state.bvid, state.cid, state.title || "");
        }
      } else {
        // 无 bvid/cid → 清空歌词
        loadedLyricsKeyRef.current = "";
        if (lyrics.length) {
          usePlayState.getState().update({ ...usePlayState.getState(), lyrics: [] });
        }
      }
    };

    return () => {
      if (!bcRef.current) return;
      bcRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeekStart = () => {
    isSeekingRef.current = true;
    setIsSeeking(true);
  };

  const handleSeek = (v: number) => {
    if (!isSeekingRef.current) handleSeekStart();
    seekingTimeRef.current = v;
    setCurrentTime(v);
  };

  const handleSeekEnd = (v: number) => {
    isSeekingRef.current = false;
    setIsSeeking(false);
    seekingTimeRef.current = 0;
    postMessage("seek", { currentTime: v });
  };

  const togglePlayMode = () => {
    postMessage("togglePlayMode");
  };

  const prev = () => {
    postMessage("prev");
  };

  const togglePlay = () => {
    postMessage("togglePlay");
  };

  const next = () => {
    postMessage("next");
  };

  const displayTime = isSeeking ? seekingTimeRef.current : currentTime;

  // 倒序找最后一个 time <= 当前进度的歌词行
  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    const currentMs = displayTime * 1000;
    for (let i = lyrics.length - 1; i >= 0; i -= 1) {
      if (currentMs >= lyrics[i].time) return i;
    }
    return 0;
  }, [displayTime, lyrics]);

  return (
    <div className="window-drag rounded-medium flex h-screen w-screen overflow-hidden select-none">
      <CoverView />
      <div className="window-no-drag flex min-w-0 flex-1 flex-col">
        {/* 第一行：歌词/歌名 */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2">
          <InfoView
            title={title}
            ownerName={ownerName}
            lyrics={lyrics}
            activeLyricIndex={activeLyricIndex}
            isHovered={isHovered}
          />
        </div>
        {/* 第二行：控件 */}
        <div className="flex items-center justify-between space-x-1 px-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            disableAnimation
            onPress={togglePlayMode}
            className="hover:text-primary window-no-drag"
            aria-label="播放模式"
          >
            {playModeIcon}
          </Button>
          <div
            className="flex items-center space-x-0.5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Button
              isDisabled={!title || isSingle}
              isIconOnly
              size="sm"
              variant="light"
              disableAnimation
              onPress={prev}
              className="hover:text-primary window-no-drag"
            >
              <RiSkipBackFill size={16} />
            </Button>
            <Button
              isDisabled={!title}
              isIconOnly
              size="sm"
              variant="light"
              disableAnimation
              onPress={() => {
                togglePlay();
              }}
              className="hover:text-primary window-no-drag"
            >
              {isPlaying ? <RiPauseCircleFill size={24} /> : <RiPlayCircleFill size={24} />}
            </Button>
            <Button
              isDisabled={!title || isSingle}
              isIconOnly
              size="sm"
              variant="light"
              disableAnimation
              onPress={() => {
                next();
              }}
              className="hover:text-primary window-no-drag"
            >
              <RiSkipForwardFill size={16} />
            </Button>
          </div>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            disableAnimation
            onPress={toggleMiniMode}
            className="hover:text-primary window-no-drag"
          >
            <RiExpandDiagonalLine size={14} />
          </Button>
        </div>
        {/* 底部贴边进度条 */}
        <Slider
          aria-label="播放进度"
          minValue={0}
          maxValue={duration}
          value={displayTime}
          onChange={v => {
            handleSeek(v as number);
          }}
          onChangeEnd={v => {
            handleSeekEnd(v as number);
          }}
          isDisabled={!title}
          size="sm"
          className="window-no-drag h-1.5 flex-none"
          classNames={{
            base: "h-1.5 items-end",
            trackWrapper: "group h-1.5 w-full",
            track: clx(
              "h-[3px] cursor-pointer translate-y-1/2 rounded-t-none bg-default-300/55",
              "transition-all duration-200 ease-out",
              {
                "group-hover:h-[5px] group-hover:translate-y-0 group-hover:bg-default-300/75": Boolean(title),
              },
            ),
            filler: "rounded-t-none",
            thumb: clx("w-2.5 h-2.5 before:w-2.5 before:h-2.5 after:h-1.5 after:bg-primary opacity-0", {
              "group-hover:opacity-100": Boolean(title),
            }),
          }}
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
