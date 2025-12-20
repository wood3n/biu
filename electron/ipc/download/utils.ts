import fs from "node:fs";
import { URLSearchParams } from "node:url";

import type { DashAudio } from "../api/types";

import { getWebInterfaceView } from "../api/web-interface-view";

const audioQualitySort = [30257, 30216, 30259, 30260, 30232, 30280, 30250, 30251];

export function sortAudio(audio: DashAudio[]) {
  return audio.toSorted((a, b) => {
    if (a.bandwidth !== b.bandwidth) {
      return b.bandwidth - a.bandwidth;
    }

    const indexA = audioQualitySort.indexOf(a.id);
    const indexB = audioQualitySort.indexOf(b.id);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexB - indexA;
  });
}

/**
 * 获取B站历史音乐的音频带宽
 * @param type -1 试听片段；0 128K；1 192K；2 320K；3 FLAC
 * @returns 音频带宽
 */
export const getStreamAudioBandwidth = (type: number) => {
  switch (type) {
    case 0:
      return 128000;
    case 1:
      return 192000;
    case 2:
      return 320000;
    default:
      return 0;
  }
};

export const ensureDir = async (dir: string) => {
  await fs.promises.mkdir(dir, { recursive: true });
};

export const removeDirOrFile = async (fsPath: string) => {
  await fs.promises.rm(fsPath, { recursive: true, force: true });
};

export const getVideoPages = async (bvid: string) => {
  const res = await getWebInterfaceView({ bvid });
  return (
    res?.data?.pages?.map(page => ({
      bvid,
      cid: page.cid,
      title: page.part,
      cover: page.first_frame,
    })) || []
  );
};

/** URL是否有效 */
export const isUrlValid = (url?: string): url is string => {
  if (!url) return false;
  const urlParams = new URLSearchParams(url);
  const deadline = urlParams.get("deadline");
  if (!deadline) return false;

  const now = Math.floor(Date.now() / 1000);
  return Number(deadline) > now;
};
