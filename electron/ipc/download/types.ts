export interface MediaDownloadTaskBase extends MediaDownloadInfo {
  id: string;
  status: MediaDownloadStatus;
  createdTime: number;
}

export interface FullMediaDownloadTask extends MediaDownloadTask {
  /** 音频url(一般2小时过期，需要重新获取) */
  audioUrl?: string;
  /** 音频编码格式 */
  audioCodecs?: string;
  /** 视频url(一般2小时过期，需要重新获取) */
  videoUrl?: string;
  /** 视频分辨率 */
  videoResolution?: string;
  /** 视频帧率 */
  videoFrameRate?: string;
  /** 文件名 */
  fileName?: string;
  /** 保存路径 */
  savePath?: string;
  /** 下载分块信息 */
  chunks?: MediaDownloadChunk[];
}

export interface MediaDownloadChunk {
  type: MediaDownloadOutputFileType;
  /** 分块文件名 */
  name: string;
  /** 分块起始字节位置 */
  start: number;
  /** 分块结束字节位置 */
  end: number;
  /** 分块是否下载完成 */
  done: boolean;
}
