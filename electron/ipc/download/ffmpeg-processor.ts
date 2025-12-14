import log from "electron-log";
import ffmpeg from "fluent-ffmpeg";

import { fixFfmpegPath } from "../../utils";

interface ConvertOptions {
  outputFileType: MediaDownloadOutputFileType;
  audioTempPath: string;
  videoTempPath?: string;
  outputPath: string;
  onProgress?: (percent: number) => void;
}

export const convert = async ({
  audioTempPath,
  videoTempPath,
  outputPath,
  outputFileType,
  onProgress,
}: ConvertOptions): Promise<void> => {
  fixFfmpegPath();
  return new Promise((resolve, reject) => {
    log.info(`Starting conversion: Audio=${audioTempPath}, Video=${videoTempPath ?? "N/A"} -> ${outputPath}`);

    const command = ffmpeg();

    // Set overwrite output option
    command.outputOptions("-y");

    if (outputFileType === "video") {
      if (!videoTempPath || !audioTempPath) {
        return reject(new Error("Video conversion requires both video and audio temp paths"));
      }
      // ffmpeg -i video -i audio -c:v copy -c:a copy -shortest output
      command.input(videoTempPath);
      command.input(audioTempPath);
      command.outputOptions(["-c:v copy", "-c:a copy", "-shortest"]);
    } else {
      // ffmpeg -i audio -c:a copy output
      command.input(audioTempPath);
      command.outputOptions(["-c:a copy"]);
    }

    command.on("progress", progress => {
      if (onProgress && progress.percent) {
        onProgress(Math.round(progress.percent * 100) / 100);
      }
    });

    command.on("error", err => {
      log.error("Cannot process video: " + err.message);
      reject(err);
    });

    command.on("end", () => {
      resolve();
    });

    // Save to output path
    command.save(outputPath);
  });
};
