import log from "electron-log";
import { EventEmitter } from "events";
import ffmpeg from "fluent-ffmpeg";

import { FileType } from "./types";

export class FFmpegProcessor extends EventEmitter {
  constructor() {
    super();
  }

  public async convert(inputPath: string, outputPath: string, format: FileType): Promise<void> {
    return new Promise((resolve, reject) => {
      log.info(`Starting conversion: ${inputPath} -> ${outputPath} [${format}]`);

      let command = ffmpeg(inputPath);

      // Configure output format
      switch (format) {
        case FileType.MP3:
          command = command.format("mp3").audioCodec("libmp3lame");
          break;
        case FileType.FLAC:
          command = command.format("flac").audioCodec("flac");
          break;
        case FileType.MP4:
          command = command.format("mp4").videoCodec("libx264").audioCodec("aac");
          break;
      }

      command
        .on("start", commandLine => {
          log.info("Spawned Ffmpeg with command: " + commandLine);
        })
        .on("progress", progress => {
          this.emit("progress", progress);
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
  }
}
