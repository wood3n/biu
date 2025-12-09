const formatter = new Intl.NumberFormat("zh-CN", {
  notation: "compact", // 紧凑模式
  compactDisplay: "short", // 短格式 (万/亿)
  maximumFractionDigits: 2, // 保留几位小数
});

export const formatNumber = (num: number | null | undefined) => {
  if (typeof num !== "number") {
    return num;
  }

  return formatter.format(num) as string;
};
