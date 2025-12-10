export enum DownloadStatus {
  WAITING = "waiting",
  DOWNLOADING = "downloading",
  CONVERTING = "converting",
  PAUSED = "paused",
  COMPLETED = "completed",
  ERROR = "error",
  CANCELLED = "cancelled",
}

export enum FileType {
  MP3 = "mp3",
  MP4 = "mp4",
  FLAC = "flac",
}

export interface DownloadOptions {
  url: string;
  referer: string;
  cookie?: string;
  userAgent?: string;
  savePath: string;
  fileName: string;
  fileType: FileType;
  quality?: string;
  coverUrl?: string;
  title?: string;
}

export interface DownloadProgress {
  totalBytes: number;
  downloadedBytes: number;
  percent: number;
  speed: number; // bytes per second
  eta: number; // seconds
}

export interface DownloadTask {
  id: string;
  options: DownloadOptions;
  status: DownloadStatus;
  progress: DownloadProgress;
  createdTime: number;
  updatedTime: number;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  retryCount: number;
  tempPath?: string;
}

export interface DownloadEvent {
  taskId: string;
  timestamp: number;
  type: "progress" | "status" | "error";
  data: any;
}

export interface ProgressEventData extends DownloadProgress {
  taskId: string;
}

export interface StatusEventData {
  taskId: string;
  status: DownloadStatus;
}

export interface ErrorEventData {
  taskId: string;
  code: string;
  message: string;
}
