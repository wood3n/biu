import log from "electron-log";
import ffmpeg from "fluent-ffmpeg";

import { fixFfmpegPath } from "../../utils";

interface ConvertOptions {
  outputFileType: MediaDownloadOutputFileType;
  /** 有些视频可能没有音频 */
  audioTempPath?: string;
  videoTempPath?: string;
  outputPath: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export const convert = async ({
  audioTempPath,
  videoTempPath,
  outputPath,
  outputFileType,
  onProgress,
  signal,
}: ConvertOptions): Promise<void> => {
  fixFfmpegPath();
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    if (signal?.aborted) {
      return reject(new Error("Aborted"));
    }

    signal?.addEventListener("abort", () => {
      command.kill("SIGKILL");
      reject(new Error("Aborted"));
    });

    // Set overwrite output option
    command.outputOptions("-y");

    if (outputFileType === "video") {
      if (!videoTempPath) {
        return reject(new Error("Video conversion requires video temp path"));
      }

      command.input(videoTempPath);

      if (audioTempPath) {
        // ffmpeg -i video -i audio -c:v copy -c:a copy -shortest output
        command.input(audioTempPath);
        command.outputOptions(["-c:v copy", "-c:a copy", "-shortest"]);
      } else {
        // ffmpeg -i video -c:v copy output
        command.outputOptions(["-c:v copy"]);
      }
    } else {
      if (!audioTempPath) {
        return reject(new Error("Audio conversion requires audio temp path"));
      }
      // ffmpeg -i audio -c:a copy output
      command.input(audioTempPath);
      command.outputOptions(["-c:a copy"]);
    }

    command.on("progress", progress => {
      if (onProgress && progress.percent) {
        onProgress(Math.round(progress.percent));
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
