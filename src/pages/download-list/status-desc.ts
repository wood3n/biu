export const StatusDesc: Record<MediaDownloadStatus, string> = {
  waiting: "等待中",
  downloading: "下载中",
  downloadPaused: "下载暂停",
  merging: "下载完成，合并分块中",
  mergePaused: "合并暂停",
  convertPaused: "转换暂停",
  converting: "转换文件格式中",
  completed: "已完成",
  failed: "任务出错",
};

export type StatusGroupKey = "active" | "paused" | "failed" | "completed";

/** 分组顺序即显示顺序 */
export const StatusGroups: { key: StatusGroupKey; label: string; statuses: MediaDownloadStatus[] }[] = [
  { key: "active", label: "进行中", statuses: ["waiting", "downloading", "merging", "converting"] },
  { key: "paused", label: "已暂停", statuses: ["downloadPaused", "mergePaused", "convertPaused"] },
  { key: "failed", label: "失败", statuses: ["failed"] },
  { key: "completed", label: "已完成", statuses: ["completed"] },
];

const statusToGroup = new Map<MediaDownloadStatus, StatusGroupKey>(
  StatusGroups.flatMap(g => g.statuses.map(s => [s, g.key] as const)),
);

export const getStatusGroup = (status: MediaDownloadStatus): StatusGroupKey => statusToGroup.get(status) ?? "active";
