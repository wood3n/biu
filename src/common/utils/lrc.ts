export type LrcLine = {
  time: number;
  text: string;
};

const timeTagRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

function parseTimeTag(match: RegExpExecArray) {
  const minutes = Number(match[1] ?? 0);
  const seconds = Number(match[2] ?? 0);
  const fractionRaw = match[3] ?? "0";
  const milliseconds = Number(fractionRaw.padEnd(3, "0"));
  return minutes * 60 + seconds + milliseconds / 1000;
}

export function parseLrc(lrc?: string | null): LrcLine[] {
  if (!lrc) return [];

  const lines: LrcLine[] = [];

  for (const rawLine of lrc.split(/\r?\n/)) {
    timeTagRegex.lastIndex = 0;
    const tags: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = timeTagRegex.exec(rawLine))) {
      tags.push(parseTimeTag(match));
    }

    const text = rawLine.replace(timeTagRegex, "").trim();
    if (tags.length === 0) continue;

    for (const time of tags) {
      lines.push({ time, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}

export function getActiveLrcIndex(lines: LrcLine[], currentTime: number | undefined) {
  if (!lines.length || typeof currentTime !== "number" || Number.isNaN(currentTime)) return -1;

  // Find the last line whose time <= currentTime
  let low = 0;
  let high = lines.length - 1;
  let ans = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lines[mid].time <= currentTime) {
      ans = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return ans;
}
