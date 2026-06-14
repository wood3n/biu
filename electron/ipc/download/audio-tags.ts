import log from "electron-log";
import got from "got";
import { ByteVector, File as TagFile, Picture, PictureType } from "node-taglib-sharp";

/** 下载封面图到内存 Buffer，失败返回 undefined（不应阻断下载主流程） */
export async function fetchCover(
  url: string | undefined,
  headers: Record<string, string>,
): Promise<Buffer | undefined> {
  if (!url) return undefined;
  try {
    const res = await got(url, {
      headers,
      timeout: { request: 10000 },
      retry: { limit: 2 },
      responseType: "buffer",
    });
    return res.body;
  } catch (err) {
    log.warn("[download] fetch cover error:", url, err);
    return undefined;
  }
}

/** 将 artist / 封面写入音频文件标签（m4a/mp3/flac）。失败只告警，不抛错 */
export function writeAudioTags(filePath: string, tags: { artist?: string; coverBuffer?: Buffer }): void {
  if (!tags.artist && !tags.coverBuffer) return;
  let file: TagFile | undefined;
  try {
    file = TagFile.createFromPath(filePath);
    if (tags.artist) {
      // node-taglib-sharp 用 performers 数组表示 artist
      file.tag.performers = [tags.artist];
    }
    if (tags.coverBuffer) {
      const pic = Picture.fromData(ByteVector.fromByteArray(tags.coverBuffer));
      pic.type = PictureType.FrontCover;
      file.tag.pictures = [pic];
    }
    file.save();
  } catch (err) {
    log.warn("[download] write audio tags error:", filePath, err);
  } finally {
    file?.dispose();
  }
}
