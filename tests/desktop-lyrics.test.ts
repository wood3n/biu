import { describe, expect, test } from "vitest";

import { isMainWindow } from "@/common/utils/desktop-lyrics";
import { findActiveLyricIndex, parseLrc } from "@/common/utils/lyrics";

describe("parseLrc", () => {
  test("解析时间标签并按时间排序", () => {
    const lines = parseLrc("[00:02.50]第二行\n[00:01.00][00:03.00]重复行");

    expect(lines).toEqual([
      { time: 1000, text: "重复行" },
      { time: 2500, text: "第二行" },
      { time: 3000, text: "重复行" },
    ]);
  });

  test("兼容 mm:ss、mm:ss.xx、mm:ss.xxx 三种时间格式", () => {
    const lines = parseLrc("[01:05]A\n[00:10.5]B\n[00:00.125]C");

    expect(lines.map(item => item.time)).toEqual([125, 10_500, 65_000]);
  });

  test("忽略空行与没有时间标签的行", () => {
    const lines = parseLrc("[00:01.00]有效\n\n纯文本行\n   \n[ar:歌手]");

    expect(lines).toEqual([{ time: 1000, text: "有效" }]);
  });

  test("空歌词返回空数组", () => {
    expect(parseLrc()).toEqual([]);
    expect(parseLrc("")).toEqual([]);
    expect(parseLrc(null)).toEqual([]);
  });
});

describe("findActiveLyricIndex", () => {
  const lines = [
    { time: 1000, text: "一" },
    { time: 3000, text: "二" },
    { time: 5000, text: "三" },
  ];

  test("歌词开始前返回 -1", () => {
    expect(findActiveLyricIndex(lines, 0)).toBe(-1);
    expect(findActiveLyricIndex(lines, 999)).toBe(-1);
  });

  test("返回当前时间对应的行", () => {
    expect(findActiveLyricIndex(lines, 1000)).toBe(0);
    expect(findActiveLyricIndex(lines, 2999)).toBe(0);
    expect(findActiveLyricIndex(lines, 3000)).toBe(1);
    expect(findActiveLyricIndex(lines, 999_999)).toBe(2);
  });

  test("空歌词返回 -1", () => {
    expect(findActiveLyricIndex([], 10_000)).toBe(-1);
  });
});

describe("isMainWindow", () => {
  test("主窗口返回 true，迷你播放器 / 桌面歌词窗口返回 false", () => {
    window.location.hash = "";
    expect(isMainWindow()).toBe(true);

    window.location.hash = "#/settings";
    expect(isMainWindow()).toBe(true);

    window.location.hash = "#mini-player";
    expect(isMainWindow()).toBe(false);

    window.location.hash = "#desktop-lyrics";
    expect(isMainWindow()).toBe(false);

    window.location.hash = "";
  });
});
