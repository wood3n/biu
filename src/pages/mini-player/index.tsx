import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Button } from "@heroui/react";
import { RiExpandDiagonalLine, RiPauseFill, RiPlayFill, RiSkipBackFill, RiSkipForwardFill } from "@remixicon/react";
import clx from "classnames";
import { useShallow } from "zustand/react/shallow";

import type { WebPlayerParams } from "@/service/web-player";

import { ReactComponent as LogoIcon } from "@/assets/icons/logo.svg";
import { getPlayModeList } from "@/common/constants/audio";
import {
  createBroadcastChannel,
  normalizeMiniPlayerBackdrop,
  toggleMiniMode,
  type MiniPlayerViewSettings,
} from "@/common/utils/mini-player";
import Image from "@/components/image";
import { getLyricsAuto, parseLrcToLines } from "@/components/lyrics/get-lyrics";
import MarqueeLights from "@/components/marquee-lights";
import { usePlayProgress } from "@/store/play-progress";
import { useSettings } from "@/store/settings";
import { StoreNameMap } from "@shared/store";

import { usePlayState } from "./play-state";
import { useStyle } from "./use-style";

const PlayModeList = getPlayModeList(16);

/** 面板圆角：与 Win11 窗口圆角同量级，光带跟着贴着面板轮廓走 */
const PANEL_RADIUS = 10;
const COVER_SIZE = 52;

/** 底板模式 -> 底板色调样式（材质本身由主进程设在窗口上，见 app.css .mini-panel--*） */
const BACKDROP_CLASSES: Record<MiniPlayerBackdrop, string> = {
  acrylic: "mini-panel--acrylic",
  light: "mini-panel--light",
  dark: "mini-panel--dark",
};

/** 玻璃上的圆形按钮：常态无底色，hover 时才浮出一层薄片 */
const glassBtn =
  "window-no-drag size-7 min-w-7 rounded-full bg-transparent! text-foreground/75 hover:bg-black/10! hover:text-primary! dark:text-foreground/85 dark:hover:bg-white/15!";

/** 无缝循环时两份文字之间的间隔 */
const MARQUEE_SEPARATOR = "\u00A0\u00A0\u00A0";
/** 滚动基准速度（像素/秒）：时长按文字宽度换算，写死秒数会让长句飞过去 */
const MARQUEE_PX_PER_SECOND = 40;
/** 一圈的时长下限（秒），短句滚得太快反而看不清 */
const MARQUEE_MIN_DURATION = 6;
/** 溢出后先静止展示句首的时间（ms） */
const MARQUEE_START_DELAY = 1000;

/**
 * 条件滚动文字：文字宽度 > 容器宽度时无缝滚动，否则居中静止。
 * 溢出时渲染双份文字 + marquee-scroll（translateX(-50%)）实现无缝循环。
 *
 * 宽度用探针量，不读分支内元素的 scrollWidth：分支一切换那些节点就脱离文档，
 * 读不到宽度还会让溢出判定来回翻转，滚动延迟永远被重置。
 */
const MarqueeText = memo(({ text, className }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const [isOverflow, setIsOverflow] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const probe = document.createElement("span");
      probe.className = className ?? "";
      probe.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;";
      probe.textContent = text;
      container.appendChild(probe);
      const width = probe.offsetWidth;
      container.removeChild(probe);

      setTextWidth(width);
      setIsOverflow(width > container.clientWidth + 1);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [text, className]);

  // 换句重新计时，先看清句首再起滚动
  useEffect(() => {
    if (!isOverflow) {
      setCanScroll(false);
      return;
    }
    setCanScroll(false);
    const timer = setTimeout(() => setCanScroll(true), MARQUEE_START_DELAY);
    return () => clearTimeout(timer);
  }, [text, isOverflow]);

  const duration = Math.max(MARQUEE_MIN_DURATION, textWidth / MARQUEE_PX_PER_SECOND);
  const isScrolling = isOverflow && canScroll;

  // 容器节点在两个分支之间保持不变，探针和 ResizeObserver 才一直挂在同一个元素上
  return (
    <div ref={containerRef} className={clx("overflow-hidden", !isScrolling && "flex justify-center")}>
      {isScrolling ? (
        // key 让换句时动画从头开始，否则新句子从上一句的位移中间冒出来
        <div key={text} className="flex w-max" style={{ animation: `marquee-scroll ${duration}s linear infinite` }}>
          <span className={className}>{text}</span>
          <span className={className} aria-hidden>
            {MARQUEE_SEPARATOR}
          </span>
          <span className={className} aria-hidden>
            {text}
          </span>
          <span className={className} aria-hidden>
            {MARQUEE_SEPARATOR}
          </span>
        </div>
      ) : (
        <span className={className}>{text}</span>
      )}
    </div>
  );
});

const CoverView = memo(() => {
  const cover = usePlayState(s => s.cover);
  if (cover) {
    return (
      <div className="mini-cover relative size-13 flex-shrink-0 overflow-hidden">
        <Image
          removeWrapper
          radius="none"
          src={cover}
          width={COVER_SIZE}
          height={COVER_SIZE}
          params="672w_378h_1c.avif"
          loading="eager"
          decoding="async"
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            willChange: "transform",
            contain: "paint",
          }}
        />
      </div>
    );
  }
  // 无封面时显示 logo 占位
  return (
    <div className="mini-cover flex size-13 flex-shrink-0 items-center justify-center bg-black/8 dark:bg-white/10">
      <LogoIcon className="text-foreground/35 size-6" />
    </div>
  );
});

// 单行文本：默认显示当前歌词行，hover 时换成「歌名 - 歌手」，无歌词时始终显示歌名（沿用原版交互）
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
    const lyric = lyrics.length > 0 && activeLyricIndex >= 0 ? lyrics[activeLyricIndex]?.text?.trim() : "";
    const lyricStyle = "text-center text-[15px] leading-tight font-semibold tracking-tight whitespace-nowrap";
    const metaStyle = "text-center text-[13px] font-medium whitespace-nowrap";

    if (isHovered) {
      if (!title) return <span className="text-foreground/45 text-center text-[13px]">暂无播放内容</span>;
      return <MarqueeText text={ownerName ? `${title} - ${ownerName}` : title} className={metaStyle} />;
    }

    if (lyric) {
      return (
        <div key={lyric} className="animate-[lyric-rise_260ms_ease-out]">
          <MarqueeText text={lyric} className={lyricStyle} />
        </div>
      );
    }

    if (!title) return <span className="text-foreground/45 text-center text-[13px]">暂无播放内容</span>;
    return <MarqueeText text={title} className={metaStyle} />;
  },
);

const MiniPlayer = () => {
  const { isSingle, isPlaying, title, playMode, ownerName } = usePlayState(
    useShallow(state => ({
      isSingle: state.isSingle,
      isPlaying: state.isPlaying,
      title: state.title,
      playMode: state.playMode,
      ownerName: state.ownerName,
    })),
  );
  const lyrics = usePlayState(s => s.lyrics);
  const [lyricOffset, setLyricOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const currentTime = usePlayProgress(s => s.currentTime);
  const setCurrentTime = usePlayProgress(s => s.setCurrentTime);
  const updatePlayState = usePlayState(state => state.update);
  const bcRef = useRef<BroadcastChannel>(null);

  // 底板/光带开关：设置由主窗口唯一写入，本窗口只读 + 收推送；
  // 底板材质要落在窗口上，只有主进程能设，所以模式一变就报过去
  const backdropFromSettings = useSettings(s => s.miniPlayerBackdrop);
  const marqueeFromSettings = useSettings(s => s.marqueeEnabled);
  const [viewOverride, setViewOverride] = useState<MiniPlayerViewSettings | null>(null);
  const backdrop = normalizeMiniPlayerBackdrop(viewOverride?.backdrop ?? backdropFromSettings);
  const marqueeEnabled = viewOverride?.marquee ?? marqueeFromSettings;

  useEffect(() => {
    void window.electron.setMiniPlayerBackdrop(backdrop);
  }, [backdrop]);

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
      const cached = store?.[key];
      const lines = parseLrcToLines(cached?.lyrics);
      // 应用歌词缓存里保存的偏移（切歌时重置为缓存值/0）
      setLyricOffset(typeof cached?.offset === "number" ? cached.offset : 0);

      let nextLines = lines;
      if (!nextLines.length) {
        const params: WebPlayerParams = { cid: Number(cid) };
        if (bvid) params.bvid = bvid;
        const result = await getLyricsAuto(params, songTitle || "", bvid, cid);
        if (result?.lyrics.length) nextLines = result.lyrics;
      }

      if (nextLines.length) {
        usePlayState.getState().update({ ...usePlayState.getState(), lyrics: nextLines });
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
      const { from, type, offset, settings, state } = ev.data || {};
      if (from !== "main") return;

      // 0. 歌词偏移实时同步：主窗口调整歌词偏移时同步应用
      if (type === "lyricsOffset" && typeof offset === "number") {
        setLyricOffset(offset);
        return;
      }
      if (type === "settings" && settings) {
        setViewOverride(settings);
        return;
      }
      if (!state) return;

      // 1. 播放进度（小窗只显示歌词，进度用于定位当前歌词行）
      if (typeof state.currentTime === "number") {
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

  // 倒序找最后一个 time <= 当前进度 + 偏移 的歌词行
  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    const currentMs = currentTime * 1000 + lyricOffset;
    for (let i = lyrics.length - 1; i >= 0; i -= 1) {
      if (currentMs >= lyrics[i].time) return i;
    }
    return 0;
  }, [currentTime, lyrics, lyricOffset]);

  return (
    <div className="window-drag h-screen w-screen overflow-hidden select-none">
      {/* 七彩跑马灯光带：贴着面板周长游走 */}
      <MarqueeLights
        mode="listen"
        block={8}
        gap={2}
        thickness={2}
        bandCount={2}
        radius={PANEL_RADIUS}
        zIndex={60}
        isPlaying={isPlaying}
        enabled={marqueeEnabled}
      />
      {/* 底板铺满整个窗口：材质/实色由主进程设在窗口上，这里只叠色调（见 app.css .mini-panel*） */}
      <div
        className={clx("mini-panel flex h-full w-full items-center gap-3 px-3", BACKDROP_CLASSES[backdrop])}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CoverView />
        {/* 右栏：上行歌词、下行控件，整列吃掉封面之外的全部宽度（沿用原版上下结构） */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-h-0 items-center justify-center overflow-hidden">
            <InfoView
              title={title}
              ownerName={ownerName}
              lyrics={lyrics}
              activeLyricIndex={activeLyricIndex}
              isHovered={isHovered}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              disableAnimation
              onPress={togglePlayMode}
              className={clx(glassBtn, "size-6 min-w-6")}
              aria-label="播放模式"
            >
              {playModeIcon}
            </Button>
            <div className="flex items-center gap-0.5">
              <Button
                isDisabled={!title || isSingle}
                isIconOnly
                size="sm"
                variant="light"
                disableAnimation
                onPress={prev}
                className={glassBtn}
                aria-label="上一首"
              >
                <RiSkipBackFill size={15} />
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
                className="window-no-drag mini-key text-foreground/85 hover:text-primary! size-7 min-w-7 rounded-full text-[13px] dark:text-white/90"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? <RiPauseFill size={13} /> : <RiPlayFill size={14} />}
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
                className={glassBtn}
                aria-label="下一首"
              >
                <RiSkipForwardFill size={15} />
              </Button>
            </div>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              disableAnimation
              onPress={toggleMiniMode}
              className={clx(glassBtn, "size-6 min-w-6")}
              aria-label="返回主界面"
            >
              <RiExpandDiagonalLine size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
