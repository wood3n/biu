import fs from "node:fs";

import type { DashAudio } from "../api/types";

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

export const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const removeDirOrFile = (fsPath: string) => {
  fs.rmSync(fsPath, { recursive: true, force: true });
};
