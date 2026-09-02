export interface BeatInfo {
  /** 触发时刻 performance.now() */
  beatAt: number;
  /** 当前估计 BPM，无置信时 0 */
  bpm: number;
  /** 0=无节拍 1=低 2=高 */
  confidence: 0 | 1 | 2;
  /** 低频能量 0-1，用于频谱变色 */
  energy: number;
  /** 全频段归一化能量 0-1 */
  overallEnergy: number;
}

export type BeatPollInfo = Omit<BeatInfo, "beatAt">;

const HISTORY_SIZE = 43; // ≈ 0.7s @ 60fps
const BASS_BINS = 10; // bin 0-10，覆盖 kick 鼓
const INTERVAL_BUFFER_SIZE = 24;
const MIN_INTERVAL_MS = 250; // 30 BPM 上限 → 2000ms，但太慢不实用，取 250ms
const MAX_INTERVAL_MS = 2000; // 30 BPM
const ONSET_THRESHOLD_K = 1.5; // 能量 > mean + k*std 判为 onset
const NO_BEAT_TIMEOUT_MS = 5000; // 5 秒无 onset → 置信度归 0
const MIN_CONFIDENCE_INTERVALS = 6;

/**
 * 实时节拍检测器（能量峰值法 / onset detection）。
 *
 * 每帧从 AnalyserNode 取频谱数据，计算低频段平均能量，
 * 与滑动历史均值+方差比较，超过阈值判为 onset 候选。
 * 收集 onset 间隔到环形缓冲，中位数 → BPM。
 *
 * 纯计算，无 React 依赖，无副作用。
 */
export class BeatDetector {
  private readonly analyser: AnalyserNode;
  private readonly freqData: Uint8Array<ArrayBuffer>;

  // 低频能量滑动历史
  private readonly energyHistory: number[] = [];

  // onset 间隔环形缓冲
  private readonly intervals: number[] = [];
  private lastOnsetTime = 0;

  // 连续无节拍计时
  private lastBeatTime = 0;

  // 当前 BPM/置信度缓存
  private bpm = 0;
  private confidence: 0 | 1 | 2 = 0;

  constructor(analyser: AnalyserNode) {
    this.analyser = analyser;
    this.freqData = new Uint8Array(analyser.frequencyBinCount);
  }

  /**
   * 每帧调用。命中 onset 时返回 BeatInfo，否则返回 null。
   * 无论是否命中，内部状态都会更新。
   */
  update(): BeatInfo | null {
    this.analyser.getByteFrequencyData(this.freqData);

    const now = performance.now();

    // 低频段平均能量
    let bassSum = 0;
    for (let i = 0; i < BASS_BINS; i++) {
      bassSum += this.freqData[i];
    }
    const bassEnergy = bassSum / (BASS_BINS * 255); // 归一化 0-1

    // 全频段平均能量
    let totalSum = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      totalSum += this.freqData[i];
    }
    const overallEnergy = totalSum / (this.freqData.length * 255);

    // 更新能量滑动历史
    this.energyHistory.push(bassEnergy);
    if (this.energyHistory.length > HISTORY_SIZE) {
      this.energyHistory.shift();
    }

    // 历史不足时无法判断 onset
    if (this.energyHistory.length < HISTORY_SIZE) {
      return null;
    }

    // 计算均值和方差
    let sum = 0;
    for (const v of this.energyHistory) {
      sum += v;
    }
    const mean = sum / this.energyHistory.length;

    let varSum = 0;
    for (const v of this.energyHistory) {
      varSum += (v - mean) ** 2;
    }
    const std = Math.sqrt(varSum / this.energyHistory.length);

    // onset 判定：能量超过 mean + k*std
    const threshold = mean + ONSET_THRESHOLD_K * std;
    const isOnset = bassEnergy > threshold && bassEnergy > 0.15; // 最低能量门限

    if (isOnset) {
      // 防抖：两次 onset 间隔至少 MIN_INTERVAL_MS
      if (now - this.lastOnsetTime >= MIN_INTERVAL_MS) {
        const interval = now - this.lastOnsetTime;
        if (this.lastOnsetTime > 0 && interval <= MAX_INTERVAL_MS) {
          this.intervals.push(interval);
          if (this.intervals.length > INTERVAL_BUFFER_SIZE) {
            this.intervals.shift();
          }
          this.updateBpm();
        }
        this.lastOnsetTime = now;
        this.lastBeatTime = now;

        return {
          beatAt: now,
          bpm: this.bpm,
          confidence: this.confidence,
          energy: bassEnergy,
          overallEnergy,
        };
      }
    }

    // 连续无节拍超时 → 置信度归 0
    if (this.lastBeatTime > 0 && now - this.lastBeatTime > NO_BEAT_TIMEOUT_MS) {
      this.confidence = 0;
      this.bpm = 0;
      this.intervals.length = 0;
    }

    return null;
  }

  /**
   * 不依赖 onset 的高频查询。每帧可调用，返回当前能量/bpm。
   */
  poll(): BeatPollInfo {
    this.analyser.getByteFrequencyData(this.freqData);

    let bassSum = 0;
    for (let i = 0; i < BASS_BINS; i++) {
      bassSum += this.freqData[i];
    }
    const bassEnergy = bassSum / (BASS_BINS * 255);

    let totalSum = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      totalSum += this.freqData[i];
    }
    const overallEnergy = totalSum / (this.freqData.length * 255);

    return {
      bpm: this.bpm,
      confidence: this.confidence,
      energy: bassEnergy,
      overallEnergy,
    };
  }

  reset(): void {
    this.energyHistory.length = 0;
    this.intervals.length = 0;
    this.lastOnsetTime = 0;
    this.lastBeatTime = 0;
    this.bpm = 0;
    this.confidence = 0;
  }

  private updateBpm(): void {
    if (this.intervals.length < MIN_CONFIDENCE_INTERVALS) {
      this.confidence = 0;
      this.bpm = 0;
      return;
    }

    // 中位数
    const sorted = [...this.intervals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    let medianInterval = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    // 2 倍/半倍误差归并：如果中位数在 [500, 1000]ms 且存在大量约一半的间隔，
    // 优先取更快的一档（人耳对 100-160 BPM 最舒适）
    if (medianInterval >= 500 && medianInterval <= 1000) {
      const halfInterval = medianInterval / 2;
      const halfCount = this.intervals.filter(i => Math.abs(i - halfInterval) < halfInterval * 0.2).length;
      if (halfCount >= this.intervals.length * 0.3) {
        medianInterval = halfInterval;
      }
    }

    let bpm = 60000 / medianInterval;

    // 限制到 60-200 BPM 范围
    if (bpm < 60) bpm *= 2;
    if (bpm > 200) bpm /= 2;
    bpm = Math.round(bpm);

    this.bpm = bpm;

    // 置信度
    const intervalCv = std(this.intervals) / medianInterval;
    if (intervalCv < 0.2) {
      this.confidence = 2;
    } else {
      this.confidence = 1;
    }
  }
}

function std(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}
