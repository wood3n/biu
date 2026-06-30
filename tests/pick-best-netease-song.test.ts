import { describe, expect, test } from "vitest";

import { pickBestNeteaseSong } from "@/pages/local-music/use-batch-match-lyrics";

/** 构造网易候选；duration 单位为毫秒 */
const song = (id: number, durationMs?: number): NeteaseSong => ({ id, duration: durationMs });

describe("pickBestNeteaseSong", () => {
  test("无候选返回 null", () => {
    expect(pickBestNeteaseSong([], 200)).toBeNull();
    expect(pickBestNeteaseSong(undefined, 200)).toBeNull();
  });

  test("过滤掉无 id 的候选", () => {
    const songs = [{ duration: 200_000 } as NeteaseSong, song(2, 200_000)];
    expect(pickBestNeteaseSong(songs, 200)?.id).toBe(2);
  });

  test("本地无时长时退化为取第一个候选", () => {
    const songs = [song(1, 999_000), song(2, 200_000)];
    expect(pickBestNeteaseSong(songs, undefined)?.id).toBe(1);
    expect(pickBestNeteaseSong(songs, NaN)?.id).toBe(1);
  });

  test("ms↔s 换算并取时长差最小者", () => {
    // 本地 200s；候选 210s(差10) / 203s(差3) / 198s(差2)
    const songs = [song(1, 210_000), song(2, 203_000), song(3, 198_000)];
    expect(pickBestNeteaseSong(songs, 200)?.id).toBe(3);
  });

  test("超出 ±5s 阈值的全部排除 → 返回 null", () => {
    const songs = [song(1, 210_000), song(2, 190_000)]; // 差 10s / 10s
    expect(pickBestNeteaseSong(songs, 200)).toBeNull();
  });

  test("差相同取排序前第一个（稳定）", () => {
    // 本地 200s；候选 202s(差2) 与 198s(差2) 同差，取靠前的 id=1
    const songs = [song(1, 202_000), song(2, 198_000)];
    expect(pickBestNeteaseSong(songs, 200)?.id).toBe(1);
  });

  test("候选无 duration 视为无穷大差，被阈值排除", () => {
    const songs = [song(1, undefined), song(2, 201_000)];
    expect(pickBestNeteaseSong(songs, 200)?.id).toBe(2);
    // 仅有无 duration 候选时，差为 Infinity > 阈值 → null
    expect(pickBestNeteaseSong([song(1, undefined)], 200)).toBeNull();
  });

  test("自定义阈值", () => {
    const songs = [song(1, 208_000)]; // 差 8s
    expect(pickBestNeteaseSong(songs, 200, 5)).toBeNull();
    expect(pickBestNeteaseSong(songs, 200, 10)?.id).toBe(1);
  });

  test("排除伴奏/无人声版本候选", () => {
    const named = (id: number, name: string, durationMs: number): NeteaseSong => ({ id, name, duration: durationMs });
    // 伴奏版时长更接近，但应被排除，取人声版
    const songs = [named(1, "晴天 (伴奏)", 200_000), named(2, "晴天", 201_000)];
    expect(pickBestNeteaseSong(songs, 200)?.id).toBe(2);

    // 中英文各类伴奏字样
    expect(pickBestNeteaseSong([named(1, "Song (Instrumental)", 200_000)], 200)).toBeNull();
    expect(pickBestNeteaseSong([named(1, "Song (Off Vocal)", 200_000)], 200)).toBeNull();
    expect(pickBestNeteaseSong([named(1, "Song (Karaoke)", 200_000)], 200)).toBeNull();
    expect(pickBestNeteaseSong([named(1, "纯音乐版", 200_000)], 200)).toBeNull();
  });
});
