/**
 * 格式化数字，将大数字转换为以万为单位，保留一位小数
 * @param num 要格式化的数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) {
    return "";
  }
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + "亿";
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "万";
  }

  return num.toString();
}
