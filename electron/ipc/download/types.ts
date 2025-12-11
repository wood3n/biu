export interface MediaDownloadChunk {
  type: MediaDownloadOutputFileType;
  /** 分块索引 */
  index: number;
  /** 分块文件名 */
  name: string;
  /** 分块起始字节位置 */
  start: number;
  /** 分块结束字节位置 */
  end: number;
  /** 分块是否下载完成 */
  done: boolean;
}

export interface DownloadCoreEventData {
  /** 下载任务ID */
  id: string;
  /** 下载任务状态 */
  status?: MediaDownloadStatus;
  /** 下载进度 */
  downloadProgress?: number;
  /** 合并进度 */
  mergeProgress?: number;
  /** 转换进度 */
  convertProgress?: number;
  /** 错误信息 */
  error?: string;
}
