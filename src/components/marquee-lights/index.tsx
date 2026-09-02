import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import {
  resetBeatDetector,
  startBeatBroadcast,
  subscribeBeatEvents,
  type BeatMessage,
} from "@/common/audio/beat-stream";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

/** 彩虹七色色板（与全局三色高亮同色系） */
const COLORS: readonly string[] = [
  "#ff0040", // 红
  "#ff7800", // 橙
  "#ffd000", // 黄
  "#00ff5a", // 绿
  "#01e3f8", // 青
  "#2c95ff", // 蓝
  "#9b5cff", // 紫
];

/** 同色成组块数：[蓝][蓝][蓝][蓝][蓝][紫][紫][紫][紫][紫]…… */
const GROUP = 5;

/** 闪光块间隔：每隔 FLASH_EVERY 个色块放一个跟随节拍闪烁的闪光块 */
const FLASH_EVERY = 4;

const STYLE_ID = "marquee-lights-style";

/** 默认一圈时长（秒），实际由 BPM 驱动 */
const DEFAULT_PERIOD_S = 4;

interface MarqueeLightsProps {
  /** broadcast=主窗口（节拍源，负责检测并广播）；listen=迷你窗口（订阅广播） */
  mode?: "broadcast" | "listen";
  /** 1:1 色块边长（px） */
  block?: number;
  /** 色块间距（px） */
  gap?: number;
  /** 色块垂直厚度（px）：主窗口 1:1 传 block；迷你播放器细条传 2（宽 8 长 × 2 厚） */
  thickness?: number;
  /** 光带色块数：broadcast 模式按窗口宽度 50% 自适应；listen 模式按 25% 自适应（也可显式传入） */
  armBlocks?: number;
  /** 灯带数量：默认 4（长-短-长-短，90° 轮转）；迷你播放器可传 2（长-短对角） */
  bandCount?: number;
  /** 叠加层级 */
  zIndex?: number;
  /** 光带圆角；缺省取全局设置 borderRadius */
  radius?: number;
  /** 播放状态覆盖：迷你窗口用自身 store，主窗口用全局 store */
  isPlaying?: boolean;
}

/**
 * 光带沿窗口周长逆时针连续游走。
 *
 * 实现：每条光带 = armBlocks 个 1:1 色块，所有色块共用同一套关键帧
 * （沿周长跑一圈：顶边 ←、左边 ↓、底边 →、右边 ↑），用 animation-delay
 * 把相邻块错开 1 个「槽位」（block+gap）的时间，于是这些块首尾相接
 * 形成一条连续光带。角点处各块自身在关键帧里转弯，光带在角上自然弯折成 L 形，
 * 全程无渐隐渐显的硬切。
 *
 * 关键帧百分比按实际窗口宽高比计算，且 0%/100% 落在同一点
 * （calc(100% - block), 0），保证循环首尾无缝。
 *
 * 两条光带相位差半圈，视觉上始终以对角形式出现（右上 L 形 ↔ 左下 L 形）。
 */
const buildCss = (block: number, gap: number, radius: number, w: number, h: number, thickness: number): string => {
  const perimeter = 2 * (w + h);
  const p1 = ((w / perimeter) * 100).toFixed(2);
  const p2 = (((w + h) / perimeter) * 100).toFixed(2);
  const p3 = (((2 * w + h) / perimeter) * 100).toFixed(2);
  const ε = 0.1; // 角点形态切换间隙（几乎无感）

  // 色块沿边方向 = block；垂直厚度 = thickness。
  // 水平边（顶/底）是横条 block×thickness，垂直边（左/右）旋转成竖条 thickness×block，
  // 在角点用宽度/高度切换实现自然转弯。
  const b = `${block}px`;
  const t = `${thickness}px`;
  const e1 = (parseFloat(p1) + ε).toFixed(2);
  const e2 = (parseFloat(p2) + ε).toFixed(2);
  const e3 = (parseFloat(p3) + ε).toFixed(2);

  return `
.marquee-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: ${radius}px;
  z-index: 9998;
}

/* 单个色块沿窗口周长顺时针绕圈：水平边横条、垂直边竖条，角点形态切换 */
@keyframes marquee-lit {
  0%   { left: calc(100% - ${b}); top: 0; width: ${b}; height: ${t}; }
  ${p1}% { left: 0; top: 0; width: ${b}; height: ${t}; }
  ${e1}% { left: 0; top: 0; width: ${t}; height: ${b}; }
  ${p2}% { left: 0; top: calc(100% - ${b}); width: ${t}; height: ${b}; }
  ${e2}% { left: 0; top: calc(100% - ${t}); width: ${b}; height: ${t}; }
  ${p3}% { left: calc(100% - ${b}); top: calc(100% - ${t}); width: ${b}; height: ${t}; }
  ${e3}% { left: calc(100% - ${t}); top: calc(100% - ${b}); width: ${t}; height: ${b}; }
  99.9% { left: calc(100% - ${t}); top: 0; width: ${t}; height: ${b}; }
  100%  { left: calc(100% - ${b}); top: 0; width: ${b}; height: ${t}; }
}

/* 灯带容器：全屏基准层，缩放以窗口中心为原点（各带错峰律动） */
.marquee-band {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform-origin: center center;
  will-change: transform, opacity;
}

/* 光带亮块：absolute 定位在 overlay（=窗口）坐标系；radius=0（直角窗口）时块也走直角 */
.marquee-lit {
  position: absolute;
  border-radius: ${radius > 0 ? "1px" : "0"};
  will-change: left, top;
  animation: marquee-lit var(--marquee-period, ${DEFAULT_PERIOD_S}s) linear infinite;
}

/* 闪光块：平时半亮保持灯带连续，节拍时由 WAAPI 提到全亮（一闪一闪） */
.marquee-lit--flash {
  opacity: 0.55;
}

.marquee-overlay[data-paused="true"] .marquee-lit {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .marquee-lit {
    animation: none !important;
    opacity: 0.7;
  }
}
`;
};

/**
 * 七彩跑马灯光带（无轨道底，仅亮带）。
 *
 * 布局：沿窗口周长连续游走的亮带，相位差 90°（迷你对角），
 * 拐角处由光带自身连续转弯自然弯折成 L 形，无暗色轨道底。
 *
 * 律动：每拍各条灯带按自身相位错峰做「放大 + 透明度」脉冲（喇叭振动），
 * 外发光由每块的 box-shadow 提供（主窗口 transparent=false 可正常溢出）；
 * 闪光块随节拍闪烁；绕圈速度一圈 ≈ 8 拍（4~16s 钳制）。
 *
 * 迷你窗口：block=8 宽 × thickness=2 高细条，水平边横条、垂直边竖条。
 */
const MarqueeLights = memo(
  ({
    mode = "broadcast",
    block = 8,
    gap = 2,
    thickness = 8,
    armBlocks: armBlocksProp,
    bandCount: bandCountProp,
    zIndex = 9998,
    radius: radiusProp,
    isPlaying: isPlayingProp,
  }: MarqueeLightsProps) => {
    const marqueeEnabled = useSettings(s => s.marqueeEnabled);
    const globalRadius = useSettings(s => s.borderRadius);
    const globalPlaying = usePlayList(s => s.isPlaying);
    const playId = usePlayList(s => s.playId);

    const isPlaying = isPlayingProp ?? globalPlaying;
    const radius = radiusProp ?? globalRadius;

    const overlayRef = useRef<HTMLDivElement>(null);
    const reducedMotionRef = useRef<MediaQueryList | null>(null);
    const periodRef = useRef<number | null>(null);

    const [winSize, setWinSize] = useState({ w: innerWidth, h: innerHeight });

    // 窗口尺寸变化（拉伸/缩放）后重建关键帧与轨道数量
    useEffect(() => {
      let raf = 0;
      const onResize = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => setWinSize({ w: innerWidth, h: innerHeight }));
      };
      window.addEventListener("resize", onResize);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
      };
    }, []);

    const { w, h } = winSize;
    const slot = block + gap;

    // 灯带长度：broadcast 按宽度 50% 自适应；listen 按宽度 25% 自适应（迷你窗口更细长）
    const armBlocks = armBlocksProp ?? Math.max(12, Math.round((w * (mode === "broadcast" ? 0.5 : 0.25)) / slot));

    // 一长一短：短带约为长带 60%
    const shortBlocks = Math.max(6, Math.round(armBlocks * 0.6));

    /** 灯带数量：默认 4（长-短-长-短，90° 轮转）；迷你可传 2（长-短，对角） */
    const bandCount = bandCountProp ?? 4;

    /** 周长槽位总数（决定相邻两块的时间错位，按窗口尺寸估算） */
    const totalSlots = 2 * (Math.floor(w / slot) + Math.floor(h / slot));

    /** 同色成组序列：每色 GROUP 个，循环整条轨道 */
    const seq = useMemo(() => {
      const colors: string[] = [];
      for (let i = 0; i < 500; i += 1) {
        colors.push(COLORS[Math.floor(i / GROUP) % COLORS.length]!);
      }
      return colors;
    }, []);

    /** 灯带：bandCount=4 长-短-长-短 相位 0/90/180/270°；bandCount=2 长-短 相位 0/180°（对角） */
    const bandDefs = useMemo(() => {
      const step = 1 / bandCount;
      return Array.from({ length: bandCount }, (_, i) => ({
        len: i % 2 === 0 ? armBlocks : shortBlocks,
        phase: i * step,
      }));
    }, [bandCount, armBlocks, shortBlocks]);

    /** 每条灯带取一段同色成组序列（颜色错开） */
    const bandColors = useMemo(
      () => bandDefs.map((band, bi) => seq.slice(bi * band.len, (bi + 1) * band.len)),
      [bandDefs, seq],
    );

    useEffect(() => {
      if (!marqueeEnabled) return;
      let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = STYLE_ID;
        styleEl.textContent = buildCss(block, gap, radius, w, h, thickness);
        document.head.appendChild(styleEl);
      }
      return () => {
        styleEl?.remove();
      };
    }, [marqueeEnabled, block, gap, radius, w, h, thickness]);

    useEffect(() => {
      if (!marqueeEnabled || mode !== "broadcast") return;
      resetBeatDetector();
      periodRef.current = null; // 切歌重置 BPM 平滑状态
    }, [playId, marqueeEnabled, mode]);

    const handleBeat = useCallback(
      (message: BeatMessage) => {
        if (message.type !== "beat" || message.confidence <= 0 || message.bpm <= 0) return;
        if (mode === "broadcast" && !usePlayList.getState().isPlaying) return;

        const el = overlayRef.current;
        if (!el) return;

        // BPM 驱动绕圈速度：一圈 ≈ 8 拍（慢速游走，快歌也不起飞）。
        // BPM 估计每拍有微小波动，直接写入会重排动画时间轴（视觉上灯带「卡一下」），
        // 故做 EMA 平滑，且变化 < 2% 不更新 CSS 变量
        const beatMs = 60000 / message.bpm;
        const period = Math.min(16, Math.max(4, (beatMs * 8) / 1000));
        const prev = periodRef.current;
        if (prev == null) {
          periodRef.current = period;
        } else {
          const smoothed = prev * 0.8 + period * 0.2;
          if (Math.abs(smoothed - prev) / prev < 0.02) {
            periodRef.current = prev;
          } else {
            periodRef.current = smoothed;
          }
        }
        if (periodRef.current !== prev) {
          el.style.setProperty("--marquee-period", `${periodRef.current.toFixed(2)}s`);
        }

        const mq = (reducedMotionRef.current ??= window.matchMedia("(prefers-reduced-motion: reduce)"));
        if (mq.matches) return;

        // 各灯带错峰律动：每条按自身相位延迟，接力式岔开「放大→缩小减弱→还原」
        const duration = Math.max(160, Math.min(480, beatMs * 0.85));
        const scale = 1 + (0.02 + Math.min(1, Math.max(0, message.energy)) * 0.03);
        const bands = el.querySelectorAll<HTMLElement>(".marquee-band");
        bands.forEach(bandEl => {
          // 相位延迟：phase 为周期占比（0/0.25/0.5/0.75 或 0/0.5）
          const phaseDelay = bandEl.dataset.phase ? Number(bandEl.dataset.phase) * period * 1000 : 0;
          bandEl.animate(
            [
              { transform: "scale(1)", opacity: 1 },
              { transform: `scale(${scale.toFixed(4)})`, opacity: 0.7, offset: 0.2 },
              { transform: "scale(1)", opacity: 1 },
            ],
            { duration, delay: phaseDelay, easing: "ease-out" },
          );
        });

        // 闪光块：每拍从半亮提到全亮（点亮 + 轻微放大后回落），一闪一闪
        const flashDur = Math.max(180, Math.min(500, beatMs * 0.9));
        el.querySelectorAll<HTMLElement>(".marquee-lit--flash").forEach(flashEl => {
          flashEl.animate(
            [
              { opacity: 0.55, transform: "scale(1)" },
              { opacity: 1, transform: "scale(1.25)", offset: 0.15 },
              { opacity: 0.55, transform: "scale(1)" },
            ],
            { duration: flashDur, easing: "ease-out" },
          );
        });
      },
      [mode],
    );

    useEffect(() => {
      if (!marqueeEnabled || !isPlaying) return;
      const onBeat = (message: BeatMessage) => {
        handleBeat(message);
      };
      if (mode === "broadcast") {
        const broadcast = startBeatBroadcast();
        broadcast.onBeat(onBeat);
        return () => broadcast.stop();
      }
      return subscribeBeatEvents(onBeat);
    }, [mode, marqueeEnabled, isPlaying, handleBeat]);

    if (!marqueeEnabled) return null;

    const glow = (color: string, strong = false) =>
      strong
        ? `0 0 4px ${color}, 0 0 12px ${color}, 0 0 24px ${color}`
        : `0 0 3px ${color}, 0 0 8px ${color}, 0 0 16px ${color}`;

    const litCss = (color: string, slotIndex: number, strong = false): CSSProperties => ({
      backgroundColor: color,
      boxShadow: glow(color, strong),
      animationDelay: `calc(var(--marquee-period, ${DEFAULT_PERIOD_S}s) * ${(-slotIndex / totalSlots).toFixed(6)})`,
    });

    const renderBand = (blocks: string[], phase: number, key: string) => (
      <div key={key} className="marquee-band" data-phase={phase}>
        {blocks.map((color, i) => {
          const slotIndex = Math.round(i + phase * totalSlots);
          const isFlash = i % FLASH_EVERY === 0;
          const cls = isFlash ? "marquee-lit marquee-lit--flash" : "marquee-lit";
          return <span key={i} className={cls} style={litCss(color, slotIndex, isFlash)} />;
        })}
      </div>
    );

    return (
      <div ref={overlayRef} aria-hidden="true" className="marquee-overlay" data-paused={!isPlaying} style={{ zIndex }}>
        {/* 灯带沿框轮转（无轨道底） */}
        {bandDefs.map((band, i) => renderBand(bandColors[i]!, band.phase, `band-${i}`))}
      </div>
    );
  },
);

export default MarqueeLights;
