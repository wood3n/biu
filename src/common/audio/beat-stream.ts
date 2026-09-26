import { usePlayList } from "@/store/play-list";
import { useSettings } from "@/store/settings";

import { BeatDetector } from "./beat-detector";
import { getSharedAnalyser, resumeSharedAnalyser } from "./shared-analyser";

export type { BeatInfo } from "./beat-detector";

export interface BeatMessage {
  from: "main" | "mini";
  type: "beat";
  /** 主窗口 performance.now() 时间戳 */
  t: number;
  bpm: number;
  confidence: 0 | 1 | 2;
  energy: number;
  overallEnergy: number;
}

const CHANNEL_NAME = "beat-sync-channel";
const FRESHNESS_MS = 500; // 收到时间与 t 偏差超过此值则丢弃
const STALE_THRESHOLD_MS = 3000; // 超过此时间无广播 → 降级呼吸灯

type BeatCallback = (m: BeatMessage) => void;

let bc: BroadcastChannel | null = null;
let rafId = 0;
let detector: BeatDetector | null = null;
const beatCallbacks: Set<BeatCallback> = new Set();
let isRunning = false;

/**
 * 主窗口侧：启动节拍检测 + 广播。
 *
 * rAF 循环驱动 BeatDetector.update()，命中 beat 时：
 * 1. 通知本地订阅者（主窗口跑马灯）
 * 2. 通过 BroadcastChannel 发送给迷你窗口
 *
 * 注意：Electron 主窗口 hide 后渲染进程 rAF 会被节流甚至暂停，
 * 节拍广播会断流。迷你窗口的 audio 单例是独立页面实例（无真正播放），
 * 无法本地检测。因此主窗口隐藏期间迷你窗口光带降级为呼吸灯，
 * 这是已知限制——主窗口是 hide 不是 destroy，恢复 show 后 rAF 自动续传。
 */
export function startBeatBroadcast(): { stop: () => void; onBeat: (cb: BeatCallback) => void } {
  if (isRunning) {
    return {
      stop: stopBeatBroadcast,
      onBeat: (cb: BeatCallback) => {
        beatCallbacks.add(cb);
      },
    };
  }
  isRunning = true;

  bc = new BroadcastChannel(CHANNEL_NAME);

  const shared = getSharedAnalyser();
  if (shared) {
    detector = new BeatDetector(shared.analyser);
  }

  const tick = () => {
    if (!detector) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    resumeSharedAnalyser();

    const beat = detector.update();
    if (beat) {
      const msg: BeatMessage = {
        from: "main",
        type: "beat",
        t: beat.beatAt,
        bpm: beat.bpm,
        confidence: beat.confidence,
        energy: beat.energy,
        overallEnergy: beat.overallEnergy,
      };

      // 通知本地订阅者
      beatCallbacks.forEach(cb => cb(msg));

      // 广播给迷你窗口
      try {
        bc?.postMessage(msg);
      } catch {
        // channel 已关闭或不可用
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return {
    stop: stopBeatBroadcast,
    onBeat: (cb: BeatCallback) => {
      beatCallbacks.add(cb);
    },
  };
}

function stopBeatBroadcast(): void {
  if (!isRunning) return;
  isRunning = false;

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  detector?.reset();
  detector = null;

  bc?.close();
  bc = null;

  beatCallbacks.clear();
}

/**
 * 迷你窗口侧：订阅主窗口广播的节拍事件。
 *
 * 对消息做 freshness 检查（收到时间与 t 偏差 > FRESHNESS_MS 丢弃）。
 * 主窗口隐藏后广播断流超过 STALE_THRESHOLD_MS 时，通知回调降级呼吸灯。
 */
export function subscribeBeatEvents(onBeat: BeatCallback): () => void {
  const channel = new BroadcastChannel(CHANNEL_NAME);
  let staleTimer = 0;

  const handler = (ev: MessageEvent) => {
    const msg = ev.data as BeatMessage;
    if (!msg || msg.from !== "main" || msg.type !== "beat") return;

    const now = performance.now();
    const delta = Math.abs(now - msg.t);
    if (delta > FRESHNESS_MS) return; // 迟到的旧节拍，丢弃

    // 重置 stale 定时器
    if (staleTimer) clearTimeout(staleTimer);
    staleTimer = window.setTimeout(() => {
      // 广播断流，通知降级
      onBeat({
        from: "main",
        type: "beat",
        t: 0,
        bpm: 0,
        confidence: 0,
        energy: 0,
        overallEnergy: 0,
      });
    }, STALE_THRESHOLD_MS);

    onBeat(msg);
  };

  channel.onmessage = handler;

  return () => {
    if (staleTimer) clearTimeout(staleTimer);
    channel.close();
  };
}

/**
 * 判断是否应该运行跑马灯（设置开启 + 正在播放）。
 * 供组件决定是否挂载广播/订阅。
 */
export function shouldRunMarquee(): boolean {
  return useSettings.getState().marqueeEnabled && usePlayList.getState().isPlaying;
}

/**
 * 判断是否是迷你窗口（通过 hash 路由区分）。
 */
export function isMiniWindow(): boolean {
  return window.location.hash.includes("mini-player");
}

/**
 * 切歌时重置检测器（由外部监听 playId 变化调用）。
 */
export function resetBeatDetector(): void {
  detector?.reset();
}
