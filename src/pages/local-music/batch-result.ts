/** 批量操作单项结果状态：歌词匹配 + 删除共用 */
export type BatchResultStatus = "matched" | "skipped" | "miss" | "failed" | "deleted" | "delete-failed";

/** 批量操作单项结果，供结果详情弹窗展示 */
export interface BatchResultItem {
  id: string;
  title: string;
  status: BatchResultStatus;
  /** 失败/未命中等附加说明，可选 */
  message?: string;
}
