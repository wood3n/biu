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
