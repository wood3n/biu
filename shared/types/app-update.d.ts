interface AppUpdateReleaseInfo {
  /** 最新版本 */
  latestVersion?: string;
  /** html 字符串 */
  releaseNotes?: string;
}

interface CheckAppUpdateResult extends AppUpdateReleaseInfo {
  isUpdateAvailable?: boolean;
  error?: string;
}

interface DownloadAppProgressInfo {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}

type DownloadAppUpdateStatus = "downloading" | "downloaded" | "error";

interface DownloadInfo {
  /** 下载完成后的文件路径 */
  filePath: string;
}

interface DownloadAppMessage {
  status: DownloadAppUpdateStatus;
  processInfo?: DownloadAppProgressInfo;
  downloadInfo?: DownloadInfo;
  error?: string;
}
