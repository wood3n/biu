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

interface MediaDownloadTaskChangeData {
  id: string;
  /** 状态 */
  status: MediaDownloadStatus;
  /** 保存路径 */
  savePath?: string;
  /** 文件大小 bytes */
  size?: number;
  /** 下载进度百分比 */
  downloadProgress?: number;
  /** ffmpeg 转换进度百分比 */
  convertProgress?: number;
  /** 下载错误信息 */
  error?: string;
}

interface MediaDownloadTask extends MediaDownloadTaskChangeData {
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
  /** 音频url(一般2小时过期，需要重新获取) */
  audioUrl?: string;
  /** 音频编码格式 */
  audioCodecs?: string;
  /** 视频url(一般2小时过期，需要重新获取) */
  videoUrl?: string;
  /** 创建时间 */
  createdTime: number;
}

interface MediaDownloadUrlData {
  audioUrl: string;
  videoUrl: string;
  audioCodecs: string;
}
