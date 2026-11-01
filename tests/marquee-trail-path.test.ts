import { describe, expect, it } from "vitest";

import { createTrailPath } from "@/components/marquee-lights/trail-path";

const point = (path: ReturnType<typeof createTrailPath>, d: number) => {
  const p = { x: 0, y: 0 };
  path.pointAt(d, p);
  return p;
};

describe("createTrailPath", () => {
  it("圆角矩形周长 = 四段直边 + 四段圆弧", () => {
    const path = createTrailPath(1600, 900, 12, 40);
    const expected = 2 * (1600 - 24 - 80) + 2 * (900 - 24 - 80) + 2 * Math.PI * 40;
    expect(path.length).toBeCloseTo(expected, 6);
  });

  it("直角时退化成矩形", () => {
    const path = createTrailPath(340, 80, 6, 0);
    expect(path.length).toBeCloseTo(2 * (340 - 12) + 2 * (80 - 12), 6);
  });

  it("圆角大于短边一半时被夹住，不会自交", () => {
    const path = createTrailPath(340, 80, 6, 999);
    const r = (80 - 12) / 2;
    expect(path.length).toBeCloseTo(2 * (340 - 12 - 2 * r) + 2 * Math.PI * r, 6);
  });

  it("首尾闭合：0 与一整圈落在同一点", () => {
    const path = createTrailPath(1200, 700, 10, 24);
    const a = point(path, 0);
    const b = point(path, path.length);
    expect(b.x).toBeCloseTo(a.x, 6);
    expect(b.y).toBeCloseTo(a.y, 6);
  });

  it("负距离向后取模（拖尾采样要取头部之前的点）", () => {
    const path = createTrailPath(1200, 700, 10, 24);
    const a = point(path, -37.5);
    const b = point(path, path.length - 37.5);
    expect(a.x).toBeCloseTo(b.x, 6);
    expect(a.y).toBeCloseTo(b.y, 6);
  });

  it("走线连续无跳变，且逐点步距不超过约束", () => {
    const path = createTrailPath(1600, 900, 12, 40);
    const step = path.length / 4000;
    let polyline = 0;
    let maxJump = 0;
    let prev = point(path, 0);
    for (let i = 1; i <= 4000; i += 1) {
      const cur = point(path, i * step);
      const d = Math.hypot(cur.x - prev.x, cur.y - prev.y);
      polyline += d;
      maxJump = Math.max(maxJump, d);
      prev = cur;
    }
    // 折线总长逼近弧长（弦长略短），说明没有断裂或回跳
    expect(polyline).toBeCloseTo(path.length, 0);
    expect(maxJump).toBeLessThanOrEqual(step * 1.0001);
  });

  it("所有点都留在内缩矩形内", () => {
    const inset = 12;
    const w = 1600;
    const h = 900;
    const path = createTrailPath(w, h, inset, 40);
    for (let i = 0; i < 2000; i += 1) {
      const p = point(path, (path.length * i) / 2000);
      expect(p.x).toBeGreaterThanOrEqual(inset - 1e-6);
      expect(p.x).toBeLessThanOrEqual(w - inset + 1e-6);
      expect(p.y).toBeGreaterThanOrEqual(inset - 1e-6);
      expect(p.y).toBeLessThanOrEqual(h - inset + 1e-6);
    }
  });

  it("退化尺寸不抛错", () => {
    const path = createTrailPath(0, 0, 10, 8);
    expect(path.length).toBe(0);
    expect(point(path, 5)).toEqual({ x: 10, y: 10 });
  });
});
