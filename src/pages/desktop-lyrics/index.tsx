import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  RiCloseLine,
  RiLockLine,
  RiLockUnlockLine,
  RiPauseFill,
  RiPlayFill,
  RiSkipBackFill,
  RiSkipForwardFill,
} from "@remixicon/react";
import clx from "classnames";
import { useShallow } from "zustand/react/shallow";

import type { DesktopLyricsViewSettings } from "@/common/utils/desktop-lyrics";
import type { MiniPlayerMainStateSnapshot } from "@/common/utils/mini-player";
import type { WebPlayerParams } from "@/service/web-player";

import {
  createDesktopLyricsChannel,
  DESKTOP_LYRICS_FONT_SIZE_MAX,
  DESKTOP_LYRICS_FONT_SIZE_MIN,
  DESKTOP_LYRICS_FONT_SIZE_STEP,
  DESKTOP_LYRICS_WIDTH_DEFAULT,
} from "@/common/utils/desktop-lyrics";
import { getLyricsAuto, parseLrcToLines } from "@/components/lyrics/get-lyrics";
import MarqueeText from "@/components/marquee-text";
import { useSettings } from "@/store/settings";
import { StoreNameMap } from "@shared/store";

import { useTransparentDocument } from "./use-style";

/** 指针命中判定向外扩张的余量，避免字号/文案宽度变化时穿透状态抖动 */
const HIT_PADDING = 10;

/** 没有下一行时间戳时的兜底行时长（ms），用于逐行进度擦除 */
const FALLBACK_LINE_DURATION = 4000;

/**
 * 裁切框与文字之间的横向留白：`0 8px 22px` 那层柔光向左右各铺约 24px，
 * 留白不足时溢出裁切会把这一圈光切平（和纵向被方框切掉是同一个毛病）。
 */
const SHADOW_GUTTER = 32;

const ToolbarButton = ({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onMouseDown={e => e.stopPropagation()}
    onClick={onPress}
    className="window-no-drag flex size-6 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white"
  >
    {children}
  </button>
);

/** 滚动基准速度（像素/秒）：时长按文字宽度换算，写死秒数会让长句飞过去 */
const LYRICS_PX_PER_SECOND = 40;
/** 一圈的时长下限（秒） */
const LYRICS_MIN_DURATION = 8;
/** 溢出后先静止展示句首的时间（ms），别一上来就滚走开头 */
const LYRICS_SCROLL_DELAY = 1500;

/**
 * 量出一行歌词的真实宽度。容器自身被 max-w-[96vw] 夹住且裁掉了溢出，
 * 读不到完整文字宽度，所以用同样式的不探针元素单独测。
 */
const measureLyricWidth = (container: HTMLElement, text: string, fontSize: number, fontFamily: string) => {
  const probe = document.createElement("span");
  probe.className = "desktop-lyrics-text";
  probe.style.cssText = "position:absolute;top:0;left:0;visibility:hidden;white-space:nowrap;";
  probe.style.fontSize = `${fontSize}px`;
  probe.style.fontFamily = fontFamily;
  probe.textContent = text;
  container.appendChild(probe);
  const width = probe.offsetWidth;
  container.removeChild(probe);
  return width;
};

/**
 * 一行歌词的一份内容：当前句用「已唱色 → 未唱色」两段渐变在行内进度处换色。
 * 分界点用 px 而不是百分比：滚动时这一份的盒子可能比文字本身宽（首尾留白），
 * 只有按文字真实宽度换算，分界才一直落在正确的字上。
 *
 * 当前句叠两层（描边层 + 上色层），任何一层都不裁切，投影才不会被切平；
 * 非当前句整行同色，一层就够。
 */
const LyricLineCopy = ({
  text,
  fontSize,
  fontFamily,
  color,
  activeColor,
  progress,
  current,
  textWidth,
  className,
  ariaHidden,
}: {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  activeColor: string;
  /** 行内进度，仅当前句用于渐变换色的分界 */
  progress: number;
  current: boolean;
  textWidth: number;
  className?: string;
  /** 滚动时衔接用的第二份只是视觉复制，读屏不必再念一遍 */
  ariaHidden?: boolean;
}) => {
  const fontStyle = { fontSize, fontFamily };

  if (!current) {
    return (
      <div className={clx("relative", className)} aria-hidden={ariaHidden || undefined}>
        <span className="desktop-lyrics-text block whitespace-nowrap" style={{ ...fontStyle, color }}>
          {text}
        </span>
      </div>
    );
  }

  const activePx = progress * textWidth;
  return (
    <div className={clx("relative", className)} aria-hidden={ariaHidden || undefined}>
      <span className="desktop-lyrics-text desktop-lyrics-text--halo block whitespace-nowrap" style={fontStyle}>
        {text}
      </span>
      <span
        className="desktop-lyrics-text desktop-lyrics-text--fill whitespace-nowrap"
        style={{
          ...fontStyle,
          backgroundImage: `linear-gradient(to right, ${activeColor} 0, ${activeColor} ${activePx}px, ${color} ${activePx}px, ${color} 100%)`,
        }}
      >
        {text}
      </span>
    </div>
  );
};

/**
 * 一行歌词：一行最多占 maxWidthPx（用户可设的屏幕宽度百分比），
 * 装不下的句子先静止展示句首、再无缝滚动，而不是把整屏宽度占满。
 * 滚动时渲染两份同内容，marquee-scroll 的 translateX(-50%) 正好位移一份，首尾相接无空白。
 */
const LyricLineView = ({
  text,
  fontSize,
  fontFamily,
  color,
  activeColor,
  progress,
  current,
  maxWidthPx,
}: {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  activeColor: string;
  /** 行内进度，仅当前句用于渐变换色的分界 */
  progress: number;
  current: boolean;
  maxWidthPx: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [textWidth, setTextWidth] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const width = measureLyricWidth(container, text, fontSize, fontFamily);
      setTextWidth(width);
      // clientWidth 含左右留白，可写的文字宽度要把它扣掉
      setIsOverflow(width > container.clientWidth - SHADOW_GUTTER * 2 + 1);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [text, fontSize, fontFamily, maxWidthPx]);

  // 换行或字号变化后重新计时，先看清句首再起滚动
  useEffect(() => {
    if (!isOverflow) {
      setCanScroll(false);
      return;
    }
    setCanScroll(false);
    const timer = setTimeout(() => setCanScroll(true), LYRICS_SCROLL_DELAY);
    return () => clearTimeout(timer);
  }, [text, fontSize, isOverflow]);

  const copyProps = { text, fontSize, fontFamily, color, activeColor, progress, current, textWidth };
  const isScrolling = isOverflow && canScroll;
  const duration = Math.max(LYRICS_MIN_DURATION, textWidth / LYRICS_PX_PER_SECOND);

  return (
    <div
      ref={containerRef}
      // 只横向裁切：overflow-y 保持 visible，否则字下那圈柔光投影会被这一层方框切平。
      // -mx-8/px-8 给描边和柔光留出横向余量，负 margin 又把文字拉回原来的位置。
      className="relative -mx-8 overflow-x-clip overflow-y-visible px-8"
      style={{ maxWidth: maxWidthPx }}
    >
      {isScrolling ? (
        <div
          // 换行必须重启动画，否则新句子从上一句的位移中间冒出来
          key={text}
          className="flex w-max will-change-transform"
          style={{ animation: `marquee-scroll ${duration}s linear infinite` }}
        >
          <LyricLineCopy {...copyProps} className="flex-none pr-10" />
          <LyricLineCopy {...copyProps} className="flex-none pr-10" ariaHidden />
        </div>
      ) : (
        <LyricLineCopy {...copyProps} />
      )}
    </div>
  );
};

const DesktopLyrics = () => {
  useTransparentDocument();

  const persisted = useSettings(
    useShallow(s => ({
      fontFamily: s.desktopLyricsFontFamily,
      fontSize: s.desktopLyricsFontSize,
      locked: s.desktopLyricsLocked,
      color: s.desktopLyricsColor,
      activeColor: s.desktopLyricsActiveColor,
      lineMode: s.desktopLyricsLineMode,
      widthPercent: s.desktopLyricsWidth,
    })),
  );

  // 本窗口只乐观更新 UI，落盘统一交给主窗口：
  // 两个窗口各持一份内存 settings，歌词条直接写盘会把主窗口的旧值覆盖回去
  const [local, setLocal] = useState<DesktopLyricsViewSettings | null>(null);
  const view = local ?? persisted;
  const { fontFamily, fontSize, locked, color, activeColor, lineMode, widthPercent } = view;

  const [snapshot, setSnapshot] = useState<MiniPlayerMainStateSnapshot | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricOffset, setLyricOffset] = useState(0);
  const [isPointerInside, setIsPointerInside] = useState(false);

  const bcRef = useRef<BroadcastChannel | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const interactiveRef = useRef(false);
  const loadedKeyRef = useRef("");
  const loadingRef = useRef(false);

  const send = (
    type: "close" | "toggleLock" | "fontSize" | "togglePlay" | "prev" | "next",
    payload?: Record<string, number>,
  ) => {
    bcRef.current?.postMessage({
      from: "desktop-lyrics",
      data: payload ? { type, ...payload } : { type },
      ts: Date.now(),
    });
  };

  // 异步加载歌词（与迷你播放器同源：先读缓存，未命中再搜索）
  const loadLyrics = async (bvid: string, cid: string, songTitle: string) => {
    const key = `${bvid}-${cid}`;
    if (loadedKeyRef.current === key) return;
    if (loadingRef.current) return;
    loadedKeyRef.current = key;
    loadingRef.current = true;

    try {
      const store = await window.electron.getStore(StoreNameMap.LyricsCache);
      const cached = store?.[key];
      const cachedOffset = typeof cached?.offset === "number" ? cached.offset : 0;
      setLyricOffset(cachedOffset);

      let lines = parseLrcToLines(cached?.lyrics);
      if (!lines.length) {
        const params: WebPlayerParams = { cid: Number(cid) };
        if (bvid) params.bvid = bvid;
        const result = await getLyricsAuto(params, songTitle || "", bvid, cid);
        if (result?.lyrics.length) lines = result.lyrics;
      }

      setLyrics(lines);
    } catch {
      // 静默失败：歌词条无歌词时回落到标题
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    const channel = createDesktopLyricsChannel();
    bcRef.current = channel;

    channel.onmessage = ev => {
      const { from, type, offset, state } = ev.data || {};
      if (from !== "main") return;

      if (type === "lyricsOffset" && typeof offset === "number") {
        setLyricOffset(offset);
        return;
      }

      // 主窗口是设置的唯一写入方，渲染参数以它推来的整包为准
      if (type === "settings" && ev.data.settings) {
        setLocal(ev.data.settings);
        return;
      }

      if (type !== "state" || !state) return;

      const next = state as MiniPlayerMainStateSnapshot;
      setSnapshot(next);

      if (next.bvid && next.cid) {
        const key = `${next.bvid}-${next.cid}`;
        if (loadedKeyRef.current !== key && !loadingRef.current) {
          void loadLyrics(next.bvid, next.cid, next.title || "");
        }
      } else if (loadedKeyRef.current) {
        loadedKeyRef.current = "";
        setLyrics([]);
      }
    };

    channel.postMessage({ from: "desktop-lyrics", data: { type: "init" }, ts: Date.now() });

    return () => {
      channel.close();
      bcRef.current = null;
    };
  }, []);

  // 未锁定时窗口默认整体鼠标穿透（只转发 mousemove）：
  // 指针进入歌词胶囊才临时恢复可交互，离开后立刻穿透回去，
  // 这样这条横跨屏幕的窗口不会挡住桌面与任务栏点击。
  useEffect(() => {
    if (locked) {
      if (interactiveRef.current) {
        interactiveRef.current = false;
        void window.electron.setDesktopLyricsInteractive(false);
      }
      setIsPointerInside(false);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const pill = pillRef.current;
      if (!pill) return;

      const rect = pill.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left - HIT_PADDING &&
        event.clientX <= rect.right + HIT_PADDING &&
        event.clientY >= rect.top - HIT_PADDING &&
        event.clientY <= rect.bottom + HIT_PADDING;

      if (inside === interactiveRef.current) return;

      interactiveRef.current = inside;
      setIsPointerInside(inside);
      void window.electron.setDesktopLyricsInteractive(inside);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [locked]);

  const title = snapshot?.title;
  const currentMs = (snapshot?.currentTime ?? 0) * 1000 + lyricOffset;

  // 窗口本身铺满工作区宽度，innerWidth 即屏幕可用宽度；
  // 主窗口的镜像没到之前（开机恢复）用默认值，避免整屏宽把柔光切掉
  const maxWidthPx = Math.round((window.innerWidth * (widthPercent ?? DESKTOP_LYRICS_WIDTH_DEFAULT)) / 100);

  // 倒序找最后一个 time <= 当前进度 + 偏移 的歌词行
  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    for (let i = lyrics.length - 1; i >= 0; i -= 1) {
      if (currentMs >= lyrics[i].time) return i;
    }
    return -1;
  }, [currentMs, lyrics]);

  // 当前行内的播放进度，用于逐字擦除上色
  const lineProgress = useMemo(() => {
    if (activeLyricIndex < 0) return 0;
    const start = lyrics[activeLyricIndex].time;
    const end = lyrics[activeLyricIndex + 1]?.time ?? start + FALLBACK_LINE_DURATION;
    if (end <= start) return 1;
    return Math.min(1, Math.max(0, (currentMs - start) / (end - start)));
  }, [activeLyricIndex, currentMs, lyrics]);

  const activeLine = activeLyricIndex >= 0 ? lyrics[activeLyricIndex].text.trim() : "";
  const nextLine = activeLyricIndex >= 0 ? (lyrics[activeLyricIndex + 1]?.text.trim() ?? "") : "";
  const text = activeLine || title || "";
  const isPlaying = snapshot?.isPlaying ?? false;
  const ownerName = snapshot?.ownerName;
  const titleLabel = title ? (ownerName ? `${title} - ${ownerName}` : title) : "";

  // 双行：当前句与下一句各占一行，行位置由当前句序号的奇偶决定。
  // 换行时高亮只是从一行移到另一行，下一句原地变成当前句，文字不会上下跳动。
  const isDouble = lineMode === "double" && Boolean(activeLine) && Boolean(nextLine);
  const rows = isDouble
    ? activeLyricIndex % 2 === 0
      ? [
          { line: activeLine, current: true },
          { line: nextLine, current: false },
        ]
      : [
          { line: nextLine, current: false },
          { line: activeLine, current: true },
        ]
    : [{ line: text, current: true }];

  // 无播放内容时整条留空，不画出可见矩形
  if (!title) return null;

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none">
      <div
        ref={pillRef}
        className={clx(
          // bottom-6：给文字下那圈柔光投影留出窗口内的绘制空间，贴边会被窗口边缘切掉
          "absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 px-4 py-1.5",
          !locked && isPointerInside && "window-drag",
        )}
      >
        {!locked && isPointerInside && (
          <div className="desktop-lyrics-toolbar window-no-drag flex items-center gap-0.5 px-1">
            {/* 歌名不缩写，超长交给跑马灯；220px 是标题区上限，再宽会把按钮推出可视区 */}
            <div className="max-w-[220px] min-w-0 shrink-0 overflow-hidden px-1">
              <MarqueeText active className="text-[12px] leading-none font-semibold text-white/85" title={titleLabel}>
                {titleLabel}
              </MarqueeText>
            </div>
            <span className="mx-1 h-3 w-px flex-none bg-white/25" />
            <ToolbarButton label="上一曲" onPress={() => send("prev")}>
              <RiSkipBackFill size={13} />
            </ToolbarButton>
            <ToolbarButton label={isPlaying ? "暂停" : "播放"} onPress={() => send("togglePlay")}>
              {isPlaying ? <RiPauseFill size={13} /> : <RiPlayFill size={13} />}
            </ToolbarButton>
            <ToolbarButton label="下一曲" onPress={() => send("next")}>
              <RiSkipForwardFill size={13} />
            </ToolbarButton>
            <span className="mx-1 h-3 w-px flex-none bg-white/25" />
            <ToolbarButton
              label={locked ? "取消锁定" : "锁定（鼠标穿透）"}
              onPress={() => {
                setLocal({ ...view, locked: !locked });
                send("toggleLock");
              }}
            >
              {locked ? <RiLockLine size={14} /> : <RiLockUnlockLine size={14} />}
            </ToolbarButton>
            <ToolbarButton
              label="减小字号"
              onPress={() => {
                const next = Math.max(DESKTOP_LYRICS_FONT_SIZE_MIN, fontSize - DESKTOP_LYRICS_FONT_SIZE_STEP);
                setLocal({ ...view, fontSize: next });
                send("fontSize", { value: next });
              }}
            >
              <span className="text-[11px] leading-none font-semibold">A-</span>
            </ToolbarButton>
            <ToolbarButton
              label="增大字号"
              onPress={() => {
                const next = Math.min(DESKTOP_LYRICS_FONT_SIZE_MAX, fontSize + DESKTOP_LYRICS_FONT_SIZE_STEP);
                setLocal({ ...view, fontSize: next });
                send("fontSize", { value: next });
              }}
            >
              <span className="text-[13px] leading-none font-semibold">A+</span>
            </ToolbarButton>
            <ToolbarButton
              label="关闭桌面歌词"
              onPress={() => {
                send("close");
              }}
            >
              <RiCloseLine size={14} />
            </ToolbarButton>
          </div>
        )}

        {rows.map(row => (
          <LyricLineView
            key={`${row.current ? "c" : "n"}-${row.line}`}
            text={row.line}
            fontSize={fontSize}
            fontFamily={fontFamily}
            color={color}
            activeColor={activeColor}
            progress={lineProgress}
            current={row.current}
            maxWidthPx={maxWidthPx}
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopLyrics;
