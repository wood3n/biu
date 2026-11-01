import { createTrailPath, type TrailPath } from "./trail-path";

/** 色相分桶数：辉光贴图按色相预生成，64 桶 = 5.6°/档，肉眼读作平滑渐变 */
const HUE_STEPS = 64;

/** 一圈内色相扫过的圈数：光带头部颜色随游走缓慢流转 */
const HUE_TURNS_PER_LAP = 1.5;

/** 一条拖尾从头到尾的色相跨度（度） */
const HUE_SPAN = 150;

/** 芯线按 alpha 分段的段数：一段一条连续折线，段内不叠色，才不会画成一串珠子 */
const CORE_SEGMENTS = 14;

/** 头部这一段额外压一条更细的近白热线 —— 灯带亮起来是「白芯 + 彩晕」，不是纯色一条线 */
const HOT_UNTIL = 0.3;

/** 辉光贴图沿拖尾的采样间隔（采样点数）。糊开的光看不出断点，不必每点都画 */
const BLOOM_EVERY = 3;

/** 尾段不再铺大半径浅光：太暗，只会糊成一串看得见断点的雾 */
const BLOOM_UNTIL = 0.68;

/** 拖尾采样点数上下限 */
const MIN_SAMPLES = 24;
const MAX_SAMPLES = 110;

/** 低于这个 alpha 就不画 */
const MIN_ALPHA = 0.02;

interface Sample {
  /** 距头部多少个像素 */
  dist: number;
  /** 0=头部，1=尾端 */
  p: number;
}

export interface MarqueeOptions {
  /** 光带芯宽（CSS px） */
  thickness: number;
  /** 光带条数，各条相位均分一圈 */
  bandCount: number;
  /** 单条拖尾长度占周长比例 */
  trailRatio: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * 辉光贴图：一张径向渐变的小 canvas。
 *
 * 不用 shadowBlur —— 它按每次 fill 走一遍离屏高斯（见频谱那次教训），而光带每帧要画几十段。
 * 预糊成贴图后每帧只是 drawImage 一张已经糊好的位图，代价与拖尾长度无关。
 */
function buildSprite(size: number, hue: number, wide: boolean): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const half = size / 2;
  const grad = g.createRadialGradient(half, half, 0, half, half, half);
  if (wide) {
    // 铺在边框内侧的一层浅光：模拟光从灯缝里透到面板上
    grad.addColorStop(0, `hsla(${hue}, 95%, 72%, 0.34)`);
    grad.addColorStop(0.45, `hsla(${hue}, 95%, 62%, 0.09)`);
    grad.addColorStop(1, `hsla(${hue}, 95%, 55%, 0)`);
  } else {
    grad.addColorStop(0, `hsla(${hue}, 100%, 74%, 0.55)`);
    grad.addColorStop(0.35, `hsla(${hue}, 100%, 62%, 0.14)`);
    grad.addColorStop(1, `hsla(${hue}, 100%, 55%, 0)`);
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/**
 * 跑马灯渲染器：一整块 canvas，沿窗口**边缘**跑「亮头 + 渐隐拖尾」。
 *
 * 贴边：走线中心距窗口边 `thickness / 2`，芯线正好铺满最外一圈像素；辉光向外那半被窗口
 * 边界吃掉、向内那半散进画面 —— 和手柄/机箱的灯缝一样，亮在最外沿，光只往里透。
 *
 * 两层画法：芯线是**一条连续折线**（按 alpha 切成十几段，段内一次 stroke，才不会画成珠子），
 * 外面叠稀疏的预糊辉光贴图做 bloom。全程 `lighter` 相加，交叠处自然过曝成白。
 *
 * 几何：走线是与窗口圆角同心的圆角矩形，按弧长取点，过弯是连续转弯。
 */
export class MarqueeRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly opts: MarqueeOptions;

  private w = 0;
  private h = 0;
  private glow = 0;
  private path: TrailPath = createTrailPath(0, 0, 0, 0);
  private ring: Path2D | null = null;
  private clearBand = 0;

  private glowSprites: HTMLCanvasElement[] = [];
  private washSprites: HTMLCanvasElement[] = [];
  private spriteSize = 0;

  private samples: Sample[] = [];
  /** 每帧复用：每条光带的采样点坐标，头部在偶数下标 */
  private pts = new Float64Array(0);

  constructor(canvas: HTMLCanvasElement, opts: MarqueeOptions) {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("canvas 2d context unavailable");
    this.ctx = ctx;
    this.opts = opts;
  }

  /** 几何与贴图都只在这里重建，每帧不再做任何分配 */
  resize(width: number, height: number, radius: number, scale: number): void {
    if (width <= 0 || height <= 0) return;
    const { thickness } = this.opts;

    // 芯线贴边：中心只留半个芯宽，辉光全朝画面内侧铺开
    const inset = thickness / 2;
    this.glow = thickness * 4;

    this.w = width;
    this.h = height;
    const corner = Math.max(0, radius - inset);
    this.path = createTrailPath(width, height, inset, corner);
    // 擦除带必须盖住最外层那圈光的实际铺展半径（浅光贴图最大画到 glow·3.15），
    // 否则超出擦除带的那圈永远不被擦掉，逐帧相加攒出一条亮环，内边界就是一条看得见的圆角硬线
    this.clearBand = inset + this.glow * 3.6;

    const ring = new Path2D();
    ring.roundRect(inset, inset, Math.max(0, width - inset * 2), Math.max(0, height - inset * 2), corner);
    this.ring = ring;

    const trail = this.path.length * this.opts.trailRatio;
    // 头密尾疏的幂律分布：头部间距约等于芯宽，尾部拉开也无所谓（芯线是按点连折线的）
    const count = clamp(Math.round((trail / Math.max(1, thickness)) ** (1 / 1.3)) + 1, MIN_SAMPLES, MAX_SAMPLES);
    this.samples = Array.from({ length: count }, (_, i) => ({
      dist: trail * (count === 1 ? 0 : (i / (count - 1)) ** 1.3),
      p: count === 1 ? 0 : i / (count - 1),
    }));
    this.pts = new Float64Array(count * 2);

    const spriteSize = Math.max(16, Math.round(this.glow * 2 * scale));
    if (spriteSize !== this.spriteSize) {
      this.spriteSize = spriteSize;
      this.glowSprites = Array.from({ length: HUE_STEPS }, (_, i) =>
        buildSprite(spriteSize, (i * 360) / HUE_STEPS, false),
      );
      this.washSprites = Array.from({ length: HUE_STEPS }, (_, i) =>
        buildSprite(spriteSize, (i * 360) / HUE_STEPS, true),
      );
    }

    this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  private pick(sprites: HTMLCanvasElement[], hue: number): HTMLCanvasElement | undefined {
    const idx = Math.round((hue / 360) * HUE_STEPS) % HUE_STEPS;
    return sprites[(idx + HUE_STEPS) % HUE_STEPS];
  }

  /** 只擦光带可能碰到的四条边；画面中央从未被绘制，也不需要每帧 memset 整个视口 */
  private clearStrips(): void {
    const { ctx } = this;
    const b = this.clearBand;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, this.w, b);
    ctx.clearRect(0, this.h - b, this.w, b);
    ctx.clearRect(0, 0, b, this.h);
    ctx.clearRect(this.w - b, 0, b, this.h);
  }

  /**
   * 画一帧。
   * @param progress 已走完的圈数（可以一直累加，取模在渲染器内部）
   * @param pulse 0~1 节拍包络，调用方负责帧间衰减
   */
  draw(progress: number, pulse: number): void {
    const { ctx } = this;
    const count = this.samples.length;
    if (this.w <= 0 || count < 2 || this.glowSprites.length === 0) return;

    this.clearStrips();
    ctx.globalCompositeOperation = "lighter";

    const headHue = progress * 360 * HUE_TURNS_PER_LAP;
    const { thickness } = this.opts;

    // 底环：一整圈很暗的同色轨道 —— 灯槽本体，光带经过时它才被点亮
    if (this.ring) {
      ctx.globalAlpha = 1;
      ctx.lineWidth = thickness;
      ctx.strokeStyle = `hsla(${headHue}, 55%, 70%, ${0.17 + pulse * 0.08})`;
      ctx.stroke(this.ring);
    }

    const lap = this.path.length;
    const bloom = 1 + pulse * 0.5;
    const point = { x: 0, y: 0 };

    for (let band = 0; band < this.opts.bandCount; band += 1) {
      const head = (progress + band / this.opts.bandCount) * lap;
      const bandHue = headHue + (band * 360) / this.opts.bandCount;

      for (let i = 0; i < count; i += 1) {
        this.path.pointAt(head - this.samples[i]!.dist, point);
        this.pts[i * 2] = point.x;
        this.pts[i * 2 + 1] = point.y;
      }

      // 外圈浅光：只在头部半段铺，稀疏采样，糊开的光看不出断点
      for (let i = 0; i < count; i += BLOOM_EVERY) {
        const s = this.samples[i]!;
        if (s.p > BLOOM_UNTIL) continue;
        const alpha = (1 - s.p) ** 1.5 * 0.8 * (0.55 + pulse * 0.45);
        if (alpha < MIN_ALPHA) continue;
        const sprite = this.pick(this.washSprites, bandHue - HUE_SPAN * s.p);
        if (!sprite) continue;
        const size = this.glow * 2 * (0.5 + 0.5 * (1 - s.p)) * bloom * 2.1;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, this.pts[i * 2]! - size / 2, this.pts[i * 2 + 1]! - size / 2, size, size);
      }

      // 芯线：一条连续折线按 alpha 切段，段内一次 stroke —— 段内不叠色，才不会画成珠子
      // 段间接头用 butt：round 头尾会在每个分段点上叠出一个亮疙瘩
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      for (let g = 0; g < CORE_SEGMENTS; g += 1) {
        const i0 = Math.floor((g * (count - 1)) / CORE_SEGMENTS);
        const i1 = Math.floor(((g + 1) * (count - 1)) / CORE_SEGMENTS);
        if (i1 <= i0) continue;
        const pm = (this.samples[i0]!.p + this.samples[i1]!.p) / 2;
        const fade = 1 - pm;
        const alpha = fade ** 1.4 * (0.62 + pulse * 0.38);
        if (alpha < MIN_ALPHA) continue;

        const seg = new Path2D();
        seg.moveTo(this.pts[i0 * 2]!, this.pts[i0 * 2 + 1]!);
        for (let i = i0 + 1; i <= i1; i += 1) seg.lineTo(this.pts[i * 2]!, this.pts[i * 2 + 1]!);
        ctx.globalAlpha = 1;
        const hue = bandHue - HUE_SPAN * pm;
        ctx.lineWidth = thickness * (0.55 + 0.45 * fade) * (1 + pulse * 0.3);
        ctx.strokeStyle = `hsla(${hue}, 100%, ${54 + 24 * fade}%, ${alpha})`;
        ctx.stroke(seg);

        // 白芯：头部一截再压一条近白细线，才有「灯珠点亮」而不是彩色蜡笔的质感
        if (pm < HOT_UNTIL) {
          ctx.lineWidth = thickness * 0.42 * (1 + pulse * 0.25);
          ctx.strokeStyle = `hsla(${hue}, 85%, 95%, ${alpha * (0.85 - (pm / HOT_UNTIL) * 0.5)})`;
          ctx.stroke(seg);
        }
      }

      // 头部再压一颗紧辉光，让最亮那一点有厚度
      const headSprite = this.pick(this.glowSprites, bandHue);
      if (headSprite) {
        const size = this.glow * 2 * bloom;
        ctx.globalAlpha = 0.5 + pulse * 0.45;
        ctx.drawImage(headSprite, this.pts[0]! - size / 2, this.pts[1]! - size / 2, size, size);
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /**
   * 静止帧：只留底环。
   * 暂停时不再发帧，光带退化成一圈很暗的轨道，告诉用户这个功能开着，同时零开销。
   */
  drawIdle(): void {
    const { ctx } = this;
    if (this.w <= 0 || !this.ring) return;
    this.clearStrips();
    ctx.lineWidth = this.opts.thickness;
    ctx.strokeStyle = "hsla(210, 30%, 78%, 0.16)";
    ctx.stroke(this.ring);
  }

  /** 整层擦干净（关闭开关时用） */
  clear(): void {
    const { ctx } = this;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, this.w, this.h);
  }
}
