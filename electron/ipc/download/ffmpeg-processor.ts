import { spawn } from "child_process";
import log from "electron-log";

interface ConvertOptions {
  outputFileType: MediaDownloadOutputFileType;
  audioTempPath: string;
  videoTempPath?: string;
  outputPath: string;
  onProgress?: (progress: any) => void;
}

export const convert = async ({
  audioTempPath,
  videoTempPath,
  outputPath,
  outputFileType,
  onProgress,
}: ConvertOptions): Promise<void> => {
  return new Promise((resolve, reject) => {
    log.info(`Starting conversion: Audio=${audioTempPath}, Video=${videoTempPath ?? "N/A"} -> ${outputPath}`);

    const args: string[] = ["-y"]; // Overwrite output files

    if (outputFileType === "video") {
      if (!videoTempPath || !audioTempPath) {
        return reject(new Error("Video conversion requires both video and audio temp paths"));
      }
      // ffmpeg -i video -i audio -c:v copy -c:a copy -shortest output
      args.push("-i", videoTempPath);
      args.push("-i", audioTempPath);
      args.push("-c:v", "copy");
      args.push("-c:a", "copy");
      args.push("-shortest");
    } else {
      // ffmpeg -i audio -c:a copy output
      args.push("-i", audioTempPath);
      args.push("-c:a", "copy");
    }

    args.push(outputPath);

    const commandLine = `ffmpeg ${args.join(" ")}`;
    log.info("Spawned Ffmpeg with command: " + commandLine);

    const ffmpeg = spawn("ffmpeg", args);

    ffmpeg.stderr.on("data", data => {
      // ffmpeg writes progress to stderr
      const output = data.toString();
      // log.debug("ffmpeg stderr: " + output); // Uncomment for verbose logging

      // Basic progress parsing (optional, but good to have if we want to mimic fluent-ffmpeg)
      // fluent-ffmpeg parses 'time=...' to calculate percent.
      // Since 'copy' is fast, we might not need precise percentage,
      // but passing something to onProgress is better than nothing if expected.
      if (onProgress && output.includes("time=")) {
        // We could extract time, but without total duration, percent is hard.
        // Just notifying that it's alive.
        onProgress({});
      }
    });

    ffmpeg.on("error", err => {
      log.error("Cannot process video: " + err.message);
      reject(err);
    });

    ffmpeg.on("close", code => {
      if (code === 0) {
        log.info("Transcoding succeeded !");
        resolve();
      } else {
        const msg = `ffmpeg exited with code ${code}`;
        log.error(msg);
        reject(new Error(msg));
      }
    });
  });
};
