import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";

// @ts-expect-error moment
momentDurationFormatSetup(moment);

export function formatDuration(seconds: number) {
  const dur = moment.duration(seconds, "seconds");

  if (seconds >= 3600) {
    // 超过 60 分钟 → hh:mm:ss
    return dur.format("hh:mm:ss", { trim: false });
  } else {
    // 小于 60 秒 → ss
    return dur.format("mm:ss", { trim: false });
  }
}

export const formatSecondsToDate = (s?: number) => (s ? moment.unix(s).format("YYYY-MM-DD") : "");

export const formatMillisecond = (s?: number) => (s ? moment(s).format("YYYY-MM-DD") : "");
