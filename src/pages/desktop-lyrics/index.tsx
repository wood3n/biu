import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

import { normalizeAnimationFps } from "@/common/audio/frame-rate";
import {
  createDesktopLyricsChannel,
  DESKTOP_LYRICS_FONT_SIZE_MAX,
  DESKTOP_LYRICS_FONT_SIZE_MIN,
  DESKTOP_LYRICS_FONT_SIZE_STEP,
} from "@/common/utils/desktop-lyrics";
import { getLyricsAuto, parseLrcToLines } from "@/components/lyrics/get-lyrics";
import MarqueeText from "@/components/marquee-text";
import { useSettings } from "@/store/settings";
import { StoreNameMap } from "@shared/store";

import { useTransparentDocument } from "./use-style";

/** 命中矩形向外扩张的余量：字号/文案宽度变化时不让穿透状态来回抖 */
const HIT_PADDING = 10;

/** 命中矩形向上多留的一条带子：工具条高 24 + 间距 4，再留点余量。工具条只在命中时出现，判定必须提前把它算进去 */
const TOOLBAR_RESERVE = 32;

/** 没有下一行时间戳时的兜底行时长（ms），用于逐行进度擦除 */
const FALLBACK_LINE_DURATION = 4000;

/**
 * 裁切框与文字之间的横向留白：`0 8px 22px` 那层柔光向左右各铺约 24px，
 * 留白不足时溢出裁切会把这一圈光切平（和纵向被方框切掉是同一个毛病）。
 * 主进程把歌词条窗口撑成「一行上限 + 两侧各这一份留白」，遮罩也正好在这段距离里渐隐。
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
 * 量出一行歌词的真实宽度。容器会被窗口宽度夹住并裁掉溢出，
 * 读不到完整文字宽度，所以用同样式的不透明探针元素单独测。
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
 *
 * 分界不写进 React：上色层只读 `--lyric-active-frac`（每帧由 rAF 写在节点上）
 * 与 `--lyric-text-w`（换行/换字号时在这里写一次），逐帧推进既不重排也不重新渲染。
 * 用 px 而不是百分比换算：滚动时这一份的盒子可能比文字本身宽（首尾留白），
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

  const fillStyle = {
    ...fontStyle,
    ["--lyric-color" as keyof React.CSSProperties]: color,
    ["--lyric-active-color" as keyof React.CSSProperties]: activeColor,
    ["--lyric-text-w" as keyof React.CSSProperties]: `${textWidth}px`,
  } as React.CSSProperties;

  return (
    <div className={clx("relative", className)} aria-hidden={ariaHidden || undefined}>
      <span className="desktop-lyrics-text desktop-lyrics-text--halo block whitespace-nowrap" style={fontStyle}>
        {text}
      </span>
      <span className="desktop-lyrics-text desktop-lyrics-text--fill whitespace-nowrap" style={fillStyle}>
        {text}
      </span>
    </div>
  );
};

/**
 * 一行歌词：窗口宽度就是用户设的「一行最多占多少屏幕」（+ 两侧留白），
 * 装不下的句子先静止展示句首、再无缝滚动，而不是把整屏宽度占满。
 * 滚动时渲染两份同内容，marquee-scroll 的 translateX(-50%) 正好位移一份，首尾相接无空白。
 */
const LyricLineView = ({
  text,
  fontSize,
  fontFamily,
  color,
  activeColor,
  current,
}: {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  activeColor: string;
  current: boolean;
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
  }, [text, fontSize, fontFamily]);

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

  const copyProps = { text, fontSize, fontFamily, color, activeColor, current, textWidth };
  const isScrolling = isOverflow && canScroll;
  const duration = Math.max(LYRICS_MIN_DURATION, textWidth / LYRICS_PX_PER_SECOND);

  return (
    <div
      ref={containerRef}
      // 窗口宽度 = 用户设的一行上限 + 两侧留白，所以这里的裁切框正好铺满窗口。
      // 只横向裁切：overflow-y 保持 visible，否则字下那圈柔光投影会被这一层方框切平。
      // 断口由 .desktop-lyrics-row 的遮罩渐隐，不是一条硬边（纵向留白也在那条规则里）。
      className="desktop-lyrics-row relative w-full overflow-x-clip overflow-y-visible px-8"
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
      animationFps: normalizeAnimationFps(s.animationFps),
    })),
  );

  // 本窗口只乐观更新 UI，落盘统一交给主窗口：
  // 两个窗口各持一份内存 settings，歌词条直接写盘会把主窗口的旧值覆盖回去
  const [local, setLocal] = useState<DesktopLyricsViewSettings | null>(null);
  const view = local ?? persisted;
  const { fontFamily, fontSize, locked, color, activeColor, lineMode, animationFps } = view;

  const [snapshot, setSnapshot] = useState<MiniPlayerMainStateSnapshot | null>(null);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [isPointerInside, setIsPointerInside] = useState(false);

  const bcRef = useRef<BroadcastChannel | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const loadedKeyRef = useRef("");
  const loadingRef = useRef(false);
  const hitRectKeyRef = useRef("");

  /**
   * 播放时钟。主窗口那侧的进度来自 audio 的 timeupdate，实测只有 3.5Hz（每 276ms 一次），
   * 直接照它上色就是一顿一顿的 PPT，而且边界永远落后半拍到一拍。
   * 所以快照到达时锚定一次，之后本窗口按帧外推：真实时间差 × 倍速。
   */
  const clockRef = useRef({ baseMs: 0, anchor: 0, playing: false, rate: 1, durationMs: 0 });
  const lyricsRef = useRef<LyricLine[]>([]);
  const offsetRef = useRef(0);
  const activeIndexRef = useRef(-1);
  const frameIntervalRef = useRef(1000 / 60);

  useEffect(() => {
    frameIntervalRef.current = 1000 / animationFps;
  }, [animationFps]);

  /** 本窗口估算的「此刻」歌词时间（已含偏移） */
  const estimateLyricsMs = (now: number) => {
    const clock = clockRef.current;
    const elapsed = clock.playing ? (now - clock.anchor) * clock.rate : 0;
    const mediaMs = clock.baseMs + elapsed;
    return (clock.durationMs > 0 ? Math.min(mediaMs, clock.durationMs) : mediaMs) + offsetRef.current;
  };

  const writeProgress = (frac: number) => {
    const value = frac.toFixed(4);
    document
      .querySelectorAll<HTMLElement>(".desktop-lyrics-text--fill")
      .forEach(el => el.style.setProperty("--lyric-active-frac", value));
  };

  /** 定位当前行 + 写上色分界；只有换行才惊动 React，逐帧推进只动一个自定义属性 */
  const syncLyricClock = (now: number) => {
    const lines = lyricsRef.current;
    const currentMs = estimateLyricsMs(now);

    let index = -1;
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      if (currentMs >= lines[i].time) {
        index = i;
        break;
      }
    }

    if (index !== activeIndexRef.current) {
      activeIndexRef.current = index;
      setActiveLyricIndex(index);
    }

    if (index < 0) {
      writeProgress(0);
      return;
    }

    const start = lines[index].time;
    const end = lines[index + 1]?.time ?? start + FALLBACK_LINE_DURATION;
    writeProgress(end <= start ? 1 : Math.min(1, Math.max(0, (currentMs - start) / (end - start))));
  };

  // 逐帧推进上色边界（帧率取共享的「动画帧率」设置，歌词条那份由主窗口镜像推过来）
  useEffect(() => {
    let rafId = 0;
    let lastAt = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const now = performance.now();
      if (now - lastAt < frameIntervalRef.current) return;
      lastAt = now;
      syncLyricClock(now);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

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
      offsetRef.current = cachedOffset;
      setLyrics([]);

      let lines = parseLrcToLines(cached?.lyrics);
      if (!lines.length) {
        const params: WebPlayerParams = { cid: Number(cid) };
        if (bvid) params.bvid = bvid;
        const result = await getLyricsAuto(params, songTitle || "", bvid, cid);
        if (result?.lyrics.length) lines = result.lyrics;
      }

      lyricsRef.current = lines;
      setLyrics(lines);
      syncLyricClock(performance.now());
    } catch {
      // 静默失败：歌词条无歌词时回落到标题
      lyricsRef.current = [];
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
        offsetRef.current = offset;
        syncLyricClock(performance.now());
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

      // 重新锚定时钟：进度、倍速、时长、播放状态都以主窗口这一包为准
      const now = performance.now();
      clockRef.current = {
        baseMs: (next.currentTime ?? 0) * 1000,
        anchor: now,
        playing: Boolean(next.isPlaying),
        rate: next.rate > 0 ? next.rate : 1,
        durationMs: (next.duration ?? 0) * 1000,
      };
      syncLyricClock(now);

      if (next.bvid && next.cid) {
        const key = `${next.bvid}-${next.cid}`;
        if (loadedKeyRef.current !== key && !loadingRef.current) {
          void loadLyrics(next.bvid, next.cid, next.title || "");
        }
      } else if (loadedKeyRef.current) {
        loadedKeyRef.current = "";
        lyricsRef.current = [];
        setLyrics([]);
      }
    };

    channel.postMessage({ from: "desktop-lyrics", data: { type: "init" }, ts: Date.now() });

    return () => {
      channel.close();
      bcRef.current = null;
    };
  }, []);

  /**
   * 命中矩形交给主进程：穿透中的窗口收不到任何鼠标事件（Windows 的 forward 实测为 0 个），
   * 所以「指针在不在字上」只能由主进程拿真实光标位置来判，判中了才取消穿透并回推 hover。
   * 矩形按歌词真实排版算，外面再包一圈余量，上方多留一条工具带的宽度。
   */
  const reportHitRect = () => {
    const pill = pillRef.current;
    if (!pill) return;

    const rect = pill.getBoundingClientRect();
    const next = {
      x: Math.round(rect.left - HIT_PADDING),
      y: Math.round(rect.top - HIT_PADDING - TOOLBAR_RESERVE),
      width: Math.round(rect.width + HIT_PADDING * 2),
      height: Math.round(rect.height + HIT_PADDING * 2 + TOOLBAR_RESERVE),
    };
    const key = `${next.x}|${next.y}|${next.width}|${next.height}`;
    if (key === hitRectKeyRef.current) return;

    hitRectKeyRef.current = key;
    void window.electron.setDesktopLyricsHitRect?.(next);
  };

  // 每次提交后：先把上色分界落到新节点上（换行时别让上一句的分界闪一帧），再看命中矩形要不要报
  useLayoutEffect(() => {
    syncLyricClock(performance.now());
    reportHitRect();
  });

  useEffect(() => {
    if (locked) {
      setIsPointerInside(false);
      return;
    }
    return window.electron.onDesktopLyricsHit?.(hit => setIsPointerInside(hit));
  }, [locked]);

  const title = snapshot?.title;
  const activeLine = activeLyricIndex >= 0 ? (lyrics[activeLyricIndex]?.text.trim() ?? "") : "";
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
    // flex 而不是 absolute + left-1/2：定位元素算宽度时可用空间只剩半屏，
    // 一条 70% 宽的歌词会被挤到 50% 就开始滚动；flex 项拿到的可用宽度是整个窗口。
    <div className="relative flex h-screen w-screen items-end justify-center overflow-hidden select-none">
      <div
        ref={pillRef}
        className={clx(
          // mb-10：给文字下那圈柔光投影（约 30px）留出窗口内的绘制空间，贴边会被窗口边缘切掉
          // w-fit：短歌词时这条只包住字，命中判定不摊满整屏；min-w-0 才允许被裁切框夹住
          "mb-10 flex w-fit min-w-0 flex-col items-center gap-1",
          !locked && isPointerInside && "window-drag",
        )}
      >
        {!locked && isPointerInside && (
          // relative z-10：.desktop-lyrics-row 用 margin-top:-32px 把投影纳进遮罩盒子里，
          // 于是每一行的盒子会向上盖住工具条这一条（实测点击落在 row 上而不是按钮上）。
          // 工具条必须显式抬一层，才打得中按钮。
          <div className="desktop-lyrics-toolbar window-no-drag relative z-10 flex items-center gap-0.5 px-2">
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
            current={row.current}
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopLyrics;
