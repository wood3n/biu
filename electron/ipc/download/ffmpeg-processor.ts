import log from "electron-log";
import ffmpeg from "fluent-ffmpeg";

interface ConvertOptions {
  outputFileType: MediaDownloadOutputFileType;
  audioTempPath: string;
  videoTempPath?: string;
  outputPath: string;
  audioCodecs?: string;
  onProgress?: (progress: any) => void;
}

export const convert = async ({
  audioTempPath,
  videoTempPath,
  outputPath,
  audioCodecs,
  outputFileType,
  onProgress,
}: ConvertOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    log.info(`Starting conversion: Audio=${audioTempPath}, Video=${videoTempPath ?? "N/A"} -> ${outputPath}`);

    let command: ffmpeg.FfmpegCommand;

    // 如果是 MP4 且存在视频临时文件，则进行合并
    if (outputFileType === "video") {
      if (videoTempPath && audioTempPath) {
        command = ffmpeg()
          .input(videoTempPath)
          .input(audioTempPath)
          .format("mp4")
          .videoCodec("libx264")
          .audioCodec("aac")
          .outputOptions("-shortest");
      }
    } else {
      command = ffmpeg(audioTempPath);

      if (audioCodecs && audioCodecs.includes("flac")) {
        command.format("flac").audioCodec("copy");
      } else {
        command.format("ipod");
        if (
          audioCodecs &&
          (audioCodecs.includes("mp4a") ||
            audioCodecs.includes("aac") ||
            audioCodecs.includes("mp3") ||
            audioCodecs.includes("ac-3") ||
            audioCodecs.includes("ec-3"))
        ) {
          command.audioCodec("copy");
        }
      }
    }

    command
      .on("start", commandLine => {
        log.info("Spawned Ffmpeg with command: " + commandLine);
      })
      .on("progress", progress => {
        onProgress?.(progress);
      })
      .on("error", (err, stdout, stderr) => {
        log.error("Cannot process video: " + err.message);
        log.error("ffmpeg stderr: " + stderr);
        reject(err);
      })
      .on("end", () => {
        log.info("Transcoding succeeded !");
        resolve();
      })
      .save(outputPath);
  });
};
