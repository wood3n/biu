type MediaDownloadStatus = "waiting" | "downloading" | "merging" | "converting" | "paused" | "completed" | "failed";

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
  sid?: string | number;
}

interface MediaDownloadTaskBase extends MediaDownloadInfo {
  id: string;
  status: MediaDownloadStatus;
  createdTime: number;
}

interface MediaDownloadTask extends MediaDownloadTaskBase {
  /** 音频编码格式 */
  audioCodecs?: string;
  /** 音频带宽 */
  audioBandwidth?: number;
  /** 视频分辨率 */
  videoResolution?: string;
  /** 视频帧率 */
  videoFrameRate?: string;
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
