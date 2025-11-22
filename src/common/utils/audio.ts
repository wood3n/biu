import log from "electron-log/renderer";
import moment from "moment";

import { getPlayerPlayurl, type DashAudio, type DashVideo } from "@/service/player-playurl";

import { VideoFnval } from "../constants/video";

const audioQualitySort = [30257, 30216, 30259, 30260, 30232, 30280, 30250, 30251];

export function sortAudio(audio: DashAudio[]) {
  return audio.toSorted((a, b) => {
    if (a.bandwidth !== b.bandwidth) {
      return b.bandwidth - a.bandwidth;
    }

    const indexA = audioQualitySort.indexOf(a.id);
    const indexB = audioQualitySort.indexOf(b.id);
    // 如果 id 不在 audioQualitySort 中，则放到最后
    if (indexA === -1) return -1;
    if (indexB === -1) return 1;
    return indexB - indexA;
  });
}

export function sortVideo(video: DashVideo[]) {
  return video.toSorted((a, b) => {
    if (a.bandwidth !== b.bandwidth) {
      return b.bandwidth - a.bandwidth;
    }

    return b.id - a.id;
  });
}

export async function getMVUrl(bvid: string, cid: string | number) {
  try {
    const getAudioInfoRes = await getPlayerPlayurl({
      bvid,
      cid,
      fnval: VideoFnval.AllDash,
    });

    const videoTrackList = sortVideo(getAudioInfoRes?.data?.dash?.video || []);
    const videoUrl = videoTrackList?.[0]?.baseUrl || videoTrackList?.[0]?.backupUrl?.[0] || "";
    const expiredTime = moment().add(110, "m").unix();

    if (getAudioInfoRes?.data?.dash?.flac?.audio) {
      return {
        isLossless: true,
        audioUrl:
          getAudioInfoRes?.data?.dash?.flac?.audio?.baseUrl ||
          getAudioInfoRes?.data?.dash?.flac?.audio?.backupUrl?.[0] ||
          "",
        videoUrl,
        expiredTime,
      };
    }

    const audioTrackList = sortAudio(getAudioInfoRes?.data?.dash?.audio || []);
    const audioTrack = audioTrackList?.[0];
    return {
      isLossless: false,
      audioUrl: audioTrack?.baseUrl || audioTrack?.backupUrl?.[0] || "",
      videoUrl,
      expiredTime,
    };
  } catch (error) {
    log.error("[Get video play url error]", error);
    return {
      isLossless: false,
    };
  }
}
