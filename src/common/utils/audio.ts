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
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
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

function selectAudioByQuality(audioList: DashAudio[], quality: AudioQuality): DashAudio | undefined {
  if (!audioList.length) return undefined;

  const sortedList = sortAudio(audioList);

  switch (quality) {
    case "high":
      return sortedList[0];
    case "medium": {
      const midIndex = Math.floor((sortedList.length - 1) / 2);
      return sortedList[midIndex];
    }
    case "low":
      return sortedList[sortedList.length - 1];
    default:
      return sortedList[0];
  }
}

export async function getMVUrl(bvid: string, cid: string | number, audioQuality: AudioQuality = "auto") {
  try {
    const getAudioInfoRes = await getPlayerPlayurl({
      bvid,
      cid,
      fnval: VideoFnval.AllDash,
    });

    const videoTrackList = sortVideo(getAudioInfoRes?.data?.dash?.video || []);
    const videoUrl = videoTrackList?.[0]?.baseUrl || videoTrackList?.[0]?.backupUrl?.[0] || "";
    const expiredTime = moment().add(110, "m").unix();

    const flacAudio = getAudioInfoRes?.data?.dash?.flac?.audio;
    const audioList = getAudioInfoRes?.data?.dash?.audio || [];

    if (audioQuality === "auto" || audioQuality === "lossless") {
      if (flacAudio) {
        return {
          isLossless: true,
          audioBandwidth: flacAudio.bandwidth,
          audioUrl: flacAudio.baseUrl || flacAudio.backupUrl?.[0] || "",
          videoUrl,
          expiredTime,
        };
      }
    }

    const selectedAudio = selectAudioByQuality(audioList, audioQuality);
    return {
      isLossless: false,
      audioBandwidth: selectedAudio?.bandwidth,
      audioUrl: selectedAudio?.baseUrl || selectedAudio?.backupUrl?.[0] || "",
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
