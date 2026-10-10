export interface LyricLine {
  /** 毫秒 */
  time: number;
  text: string;
}

const timeTagPattern = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

/**
 * 解析 LRC 歌词文本
 */
export function parseLrc(raw?: null | string): LyricLine[] {
  if (!raw) return [];

  const result: LyricLine[] = [];
  const lines = raw.split(/\r?\n/);

  lines.forEach(line => {
    const text = line.replace(timeTagPattern, "").trim();
    if (!text) return;

    timeTagPattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = timeTagPattern.exec(line)) !== null) {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const millis = match[3] ? Number(match[3].padEnd(3, "0")) : 0;

      if (Number.isNaN(minutes) || Number.isNaN(seconds) || Number.isNaN(millis)) continue;

      const time = Math.max(0, minutes * 60 * 1000 + seconds * 1000 + millis);
      result.push({ time, text });
    }

    timeTagPattern.lastIndex = 0;
  });

  return result.toSorted((a, b) => a.time - b.time);
}

/**
 * 查询当前时间对应的歌词行，未开始时返回 -1
 */
export function findActiveLyricIndex(lines: LyricLine[], currentMs: number) {
  if (!lines.length) return -1;

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (currentMs >= lines[i].time) return i;
  }

  return -1;
}
