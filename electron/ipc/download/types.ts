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
