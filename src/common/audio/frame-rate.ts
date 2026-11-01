import { useSettings } from "@/store/settings";

/** 动画帧率候选档，顺序即设置页下拉顺序 */
export const ANIMATION_FPS_OPTIONS: readonly number[] = [30, 60, 90, 120, 144];

/**
 * 把磁盘/导入来的任意值回落到最近候选档。
 * 不在档位里时下拉框会显示成空，且 rAF 间隔要落到有限正数。
 */
export function normalizeAnimationFps(value: unknown): number {
  const fps = Number(value);
  if (!Number.isFinite(fps)) return 60;
  return ANIMATION_FPS_OPTIONS.reduce((best, item) => (Math.abs(item - fps) < Math.abs(best - fps) ? item : best));
}

/**
 * 两次重绘之间的最小间隔（毫秒）。
 * requestAnimationFrame 是按显示器刷新率发帧的，不限帧就会在 144Hz 屏上跑到每秒 144 次重绘。
 */
export function getFrameIntervalMs(): number {
  return 1000 / normalizeAnimationFps(useSettings.getState().animationFps);
}
