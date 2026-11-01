/** 光带走线：圆角矩形的弧长参数化路径 */

interface LineSeg {
  kind: "line";
  len: number;
  x: number;
  y: number;
  ux: number;
  uy: number;
}

interface ArcSeg {
  kind: "arc";
  len: number;
  cx: number;
  cy: number;
  r: number;
  a0: number;
}

type Seg = LineSeg | ArcSeg;

export interface TrailPath {
  /** 一圈总长（px） */
  length: number;
  /** 沿路径 distance 处取点（自动取模，方向为顺时针） */
  pointAt(distance: number, out: { x: number; y: number }): void;
}

const HALF_PI = Math.PI / 2;

/**
 * 生成顺时针闭合走线：顶边 →↗ 右上弧 → 右边 → 右下弧 → 底边 → 左下弧 → 左边 → 左上弧。
 *
 * 只建一次（窗口尺寸/内缩/圆角变化时重建），之后每帧按弧长取点，
 * 于是色带过弯是沿着圆弧连续转弯，不是四段直角硬折。
 */
export function createTrailPath(width: number, height: number, inset: number, corner: number): TrailPath {
  const x0 = inset;
  const y0 = inset;
  const x1 = Math.max(x0, width - inset);
  const y1 = Math.max(y0, height - inset);
  const r = Math.max(0, Math.min(corner, Math.min(x1 - x0, y1 - y0) / 2));

  const segs: Seg[] = [];
  const line = (x: number, y: number, ux: number, uy: number, len: number) => {
    if (len > 0) segs.push({ kind: "line", len, x, y, ux, uy });
  };
  const arc = (cx: number, cy: number, a0: number) => {
    if (r > 0) segs.push({ kind: "arc", len: r * HALF_PI, cx, cy, r, a0 });
  };

  line(x0 + r, y0, 1, 0, x1 - x0 - 2 * r);
  arc(x1 - r, y0 + r, -HALF_PI);
  line(x1, y0 + r, 0, 1, y1 - y0 - 2 * r);
  arc(x1 - r, y1 - r, 0);
  line(x1 - r, y1, -1, 0, x1 - x0 - 2 * r);
  arc(x0 + r, y1 - r, HALF_PI);
  line(x0, y1 - r, 0, -1, y1 - y0 - 2 * r);
  arc(x0 + r, y0 + r, Math.PI);

  let length = 0;
  for (const seg of segs) length += seg.len;
  if (length <= 0) {
    return {
      length: 0,
      pointAt: (_d, out) => {
        out.x = x0;
        out.y = y0;
      },
    };
  }

  return {
    length,
    pointAt(distance, out) {
      let s = distance % length;
      if (s < 0) s += length;
      for (const seg of segs) {
        if (s <= seg.len) {
          if (seg.kind === "line") {
            out.x = seg.x + seg.ux * s;
            out.y = seg.y + seg.uy * s;
          } else {
            const a = seg.a0 + s / seg.r;
            out.x = seg.cx + Math.cos(a) * seg.r;
            out.y = seg.cy + Math.sin(a) * seg.r;
          }
          return;
        }
        s -= seg.len;
      }
      // 浮点余量走到末尾时回起点
      out.x = x0 + r;
      out.y = y0;
    },
  };
}
