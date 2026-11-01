import { memo, useCallback, useEffect, useRef } from "react";

import {
  resetBeatDetector,
  startBeatBroadcast,
  subscribeBeatEvents,
  type BeatMessage,
} from "@/common/audio/beat-stream";
import { getFrameIntervalMs } from "@/common/audio/frame-rate";
import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import { MarqueeRenderer } from "./renderer";

/** 没检测到 BPM 时一圈的默认时长（秒） */
const DEFAULT_PERIOD_S = 8;

/** canvas 位图倍率上限：光带本来就是一团糊出来的辉光，2 倍 DPR 只是把每帧像素量翻四倍 */
const MAX_SCALE = 1.5;

interface MarqueeLightsProps {
  /** broadcast=主窗口（节拍源，负责检测并广播）；listen=迷你窗口（订阅广播） */
  mode?: "broadcast" | "listen";
  /** 光带芯宽（CSS px） */
  thickness?: number;
  /** 光带条数，各条相位均分一圈 */
  bandCount?: number;
  /** 单条拖尾长度占周长比例；缺省主窗口 0.2、迷你窗口 0.34 */
  trailRatio?: number;
  /** 窗口圆角，光带走线与它同心；缺省取全局设置 borderRadius */
  radius?: number;
  /** 叠加层级 */
  zIndex?: number;
  /** 播放状态覆盖：迷你窗口用自身 store，主窗口用全局 store */
  isPlaying?: boolean;
  /** 开关覆盖：迷你窗口的设置由主窗口下发，本地那份要等重启才更新，故直接收推送 */
  enabled?: boolean;
}

/**
 * 七彩跑马灯光带：贴着窗口边缘游走的「亮头 + 渐隐拖尾」，亮度与辉光跟节拍走。
 *
 * 渲染：一整块 canvas。旧实现是 ~200 个 span 各自绕窗口周长跑 transform 动画，
 * 每个元素一个合成图层、每块挂三层 box-shadow（Skia 按 fill 走离屏高斯）；
 * 现在每帧只做几十次 drawImage，画的是预先糊好的辉光贴图，且只擦光带碰得到的四条边。
 *
 * 律动：一圈时长按 BPM 走（EMA 平滑，见 handleBeat）；每拍把 pulse 抬到能量值，再按时间指数衰减，
 * 于是亮度和辉光是连续呼吸而不是阶跃。
 *
 * 静止：暂停、`prefers-reduced-motion`、页面不可见时直接停掉 rAF —— 不发帧就不画，
 * 桌面上只留一圈很暗的底环。
 */
const MarqueeLights = memo(
  ({
    mode = "broadcast",
    thickness = 4,
    bandCount = 3,
    trailRatio = mode === "broadcast" ? 0.2 : 0.34,
    radius: radiusProp,
    zIndex = 9998,
    isPlaying: isPlayingProp,
    enabled: enabledProp,
  }: MarqueeLightsProps) => {
    const marqueeEnabledFromSettings = useSettings(s => s.marqueeEnabled);
    const globalRadius = useSettings(s => s.borderRadius);
    const globalPlaying = usePlayList(s => s.isPlaying);
    const playId = usePlayList(s => s.playId);

    const marqueeEnabled = enabledProp ?? marqueeEnabledFromSettings;
    const isPlaying = isPlayingProp ?? globalPlaying;
    const radius = radiusProp ?? globalRadius;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const apiRef = useRef<{ start: () => void; stop: () => void; resize: () => void } | null>(null);

    /** 已走完的圈数（累加，取模在渲染器内部） */
    const progressRef = useRef(0);
    /** 一圈时长，BPM 驱动 */
    const periodRef = useRef(DEFAULT_PERIOD_S);
    /** 拍长（毫秒），决定 pulse 衰减快慢 */
    const beatMsRef = useRef(500);
    /** 节拍包络 0~1 */
    const pulseRef = useRef(0);
    /** EMA 后的圈时长，用于抑制 BPM 抖动 */
    const periodEmaRef = useRef<number | null>(null);
    const reducedMotionRef = useRef<MediaQueryList | null>(null);
    const radiusRef = useRef(radius);
    /** 开关 + 播放态 + 页面可见，即「这一帧该不该动」 */
    const activeRef = useRef(false);

    const isReducedMotion = () =>
      (reducedMotionRef.current ??= window.matchMedia("(prefers-reduced-motion: reduce)")).matches;

    useEffect(() => {
      if (!marqueeEnabled || mode !== "broadcast") return;
      resetBeatDetector();
      periodEmaRef.current = null; // 切歌重置 BPM 平滑状态
    }, [playId, marqueeEnabled, mode]);

    const handleBeat = useCallback(
      (message: BeatMessage) => {
        if (message.type !== "beat" || message.confidence <= 0 || message.bpm <= 0) return;
        if (mode === "broadcast" && !usePlayList.getState().isPlaying) return;

        const beatMs = 60000 / message.bpm;
        beatMsRef.current = beatMs;

        // 一圈 ≈ 8 拍（慢速游走，快歌也不起飞，4~16s 钳制）。
        // BPM 估计每拍都有微小波动，直接写入会让游走速度一顿一顿，故做 EMA，相对变化 < 2% 时不更新
        const period = Math.min(16, Math.max(4, (beatMs * 8) / 1000));
        const prev = periodEmaRef.current;
        if (prev == null) {
          periodEmaRef.current = period;
        } else {
          const smoothed = prev * 0.8 + period * 0.2;
          periodEmaRef.current = Math.abs(smoothed - prev) / prev < 0.02 ? prev : smoothed;
        }
        periodRef.current = periodEmaRef.current;

        pulseRef.current = Math.max(pulseRef.current, Math.min(1, Math.max(0, message.energy)));
      },
      [mode],
    );

    useEffect(() => {
      if (!marqueeEnabled || !isPlaying) return;
      if (mode === "broadcast") {
        const broadcast = startBeatBroadcast();
        broadcast.onBeat(handleBeat);
        return () => broadcast.stop();
      }
      return subscribeBeatEvents(handleBeat);
    }, [mode, marqueeEnabled, isPlaying, handleBeat]);

    // 渲染器与 rAF 循环：只在开关/几何参数变化时重建（圆角走 resize，不重建贴图）
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!marqueeEnabled || !canvas) return;

      const renderer = new MarqueeRenderer(canvas, { thickness, bandCount, trailRatio });
      let raf = 0;
      let lastTick = 0;

      const applySize = () => {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        const scale = Math.min(window.devicePixelRatio || 1, MAX_SCALE);
        const bw = Math.max(1, Math.round(w * scale));
        const bh = Math.max(1, Math.round(h * scale));
        // 给 canvas.width 赋值会清空位图：尺寸没变就别写，否则拖圆角滑块时每帧闪一下空白
        if (canvas.width !== bw) canvas.width = bw;
        if (canvas.height !== bh) canvas.height = bh;
        renderer.resize(w, h, radiusRef.current, scale);
      };

      applySize();

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const elapsed = now - lastTick;
        if (elapsed < getFrameIntervalMs()) return;
        lastTick = now;

        // 切回前台可能一下跳过几百毫秒，钳住步长，免得光带瞬移、pulse 直接归零
        const dt = Math.min(0.25, elapsed / 1000);
        progressRef.current += dt / periodRef.current;
        pulseRef.current *= Math.exp(-dt / ((beatMsRef.current * 0.45) / 1000));
        renderer.draw(progressRef.current, pulseRef.current);
      };

      const stopLoop = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      };

      const start = () => {
        if (raf || !activeRef.current) return;
        if (isReducedMotion()) {
          renderer.draw(progressRef.current, 0);
          return;
        }
        lastTick = performance.now();
        raf = requestAnimationFrame(frame);
      };

      const stop = () => {
        stopLoop();
        renderer.drawIdle();
      };

      apiRef.current = { start, stop, resize: applySize };

      const onResize = () => {
        stopLoop();
        applySize();
        if (activeRef.current && !isReducedMotion()) start();
        else renderer.drawIdle();
      };
      window.addEventListener("resize", onResize);

      // 主窗口 hide / 最小化后 rAF 本来就被节流，这里显式停表，回到前台再续
      const onVisibility = () => {
        if (document.hidden) stopLoop();
        else if (activeRef.current) start();
      };
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        stopLoop();
        apiRef.current = null;
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVisibility);
        renderer.clear();
      };
    }, [marqueeEnabled, thickness, bandCount, trailRatio, mode]);

    // 圆角只改走线，不重建渲染器
    useEffect(() => {
      radiusRef.current = radius;
      apiRef.current?.resize();
    }, [radius]);

    // 播放态切换：暂停即停表（不再发帧），恢复时接着上次的圈数继续跑
    useEffect(() => {
      activeRef.current = marqueeEnabled && isPlaying && !document.hidden;
      const api = apiRef.current;
      if (!api) return;
      if (activeRef.current) api.start();
      else api.stop();
    }, [marqueeEnabled, isPlaying]);

    if (!marqueeEnabled) return null;

    return (
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex }}>
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    );
  },
);

export default MarqueeLights;
