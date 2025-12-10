type FileDownloadStatus = "waiting" | "downloading" | "converting" | "paused" | "completed" | "error" | "cancelled";

interface MediaDownloadParams {
  /** 视频bvid */
  bvid?: string;
  /** 视频分集cid */
  cid?: string;
  /** 音频sid */
  sid?: string;
  /** 标题 */
  title?: string;
  /** 封面 */
  cover?: string;
}

type FileType = "mp3" | "mp4" | "flac";

interface MediaDownloadTask extends MediaDownloadParams {
  id: string;
  /** 音频/视频质量 */
  quality: string;
  /** 文件名 */
  fileName: string;
  /** 文件类型 */
  fileType: FileType;
  /** 保存路径 */
  savePath: string;
  /** 状态 */
  status: FileDownloadStatus;
  /** 进度百分比 */
  progress: number;
  /** 文件大小 bytes */
  size: number;
  /** 任务创建时间 */
  createdTime: number;
  /** 下载错误信息 */
  error?: string;
}
