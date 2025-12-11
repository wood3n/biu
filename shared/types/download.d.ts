type MediaDownloadStatus =
  | "resolving"
  | "waiting"
  | "downloading"
  | "merging"
  | "converting"
  | "paused"
  | "completed"
  | "error";

type MediaDownloadOutputFileType = "audio" | "video";

interface MediaDownloadInfo {
  /** 文件类型 */
  outputFileType: MediaDownloadOutputFileType;
  /** 标题 */
  title: string;
  /** 封面 */
  cover?: string;
  /** 视频bvid */
  bvid?: string;
  /** 视频分集cid */
  cid?: string;
  /** 音频sid */
  sid?: string;
}

interface MediaDownloadTask extends MediaDownloadInfo {
  id: string;
  /** 音频url(一般2小时过期，需要重新获取) */
  audioUrl?: string;
  /** 音频编码格式 */
  audioCodecs?: string;
  /** 视频url(一般2小时过期，需要重新获取) */
  videoUrl?: string;
  /** 创建时间 */
  createdTime: number;
  /** 状态 */
  status: MediaDownloadStatus;
  /** 保存路径 */
  savePath?: string;
  /** 文件大小 bytes */
  totalBytes?: number;
  /** 下载进度百分比 */
  downloadProgress?: number;
  /** 合并进度百分比 */
  mergeProgress?: number;
  /** ffmpeg 转换进度百分比 */
  convertProgress?: number;
  /** 下载错误信息 */
  error?: string;
}

interface MediaDownloadUrlData {
  audioUrl: string;
  videoUrl: string;
  audioCodecs: string;
}
