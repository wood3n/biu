import moment from "moment";
import momentDurationFormatSetup from "moment-duration-format";

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

/**
 * 相对时间格式化（如：刚刚 / 5分钟前 / 3天前 / 2024-01-01）
 * @param timestamp 毫秒时间戳
 */
export function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  // 超过30天显示具体日期
  return moment(timestamp).format("YYYY-MM-DD");
}
