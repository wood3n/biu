import log from "electron-log/renderer";
import moment from "moment";

import { getAudioWebStreamUrl } from "@/service/audio-web-url";
import { getPlayerPlayurl, type DashAudio } from "@/service/player-playurl";
import { useUser } from "@/store/user";

import { audioQualitySort } from "../constants/audio";
import { VideoFnval } from "../constants/video";
import { getUrlParams } from "./url";

function sortAudio(audio: DashAudio[]) {
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

export async function getDashUrl(bvid: string, cid: string | number, audioQuality: AudioQuality = "auto") {
  try {
    const getUrlInfoRes = await getPlayerPlayurl({
      bvid,
      cid,
      fnval: VideoFnval.AllDash,
    });

    const bestVideoInfo = getUrlInfoRes?.data?.dash?.video?.[0];
    const videoResolution = `${bestVideoInfo?.width}x${bestVideoInfo?.height}`;
    const videoUrl = bestVideoInfo?.baseUrl || bestVideoInfo?.backupUrl?.[0];
    const flacAudio = getUrlInfoRes?.data?.dash?.flac?.audio;
    const dolbyAudio = getUrlInfoRes?.data?.dash?.dolby?.audio?.[0];

    if (audioQuality === "auto" || audioQuality === "lossless") {
      if (flacAudio) {
        return {
          isLossless: true,
          audioCodecs: flacAudio.codecs.toLowerCase(),
          audioBandwidth: flacAudio.bandwidth,
          audioUrl: flacAudio.baseUrl || flacAudio.backupUrl[0],
          videoUrl,
          videoResolution,
        };
      }

      if (dolbyAudio) {
        return {
          isLossless: false,
          isDolby: true,
          audioCodecs: dolbyAudio.codecs.toLowerCase(),
          audioBandwidth: dolbyAudio.bandwidth,
          audioUrl: dolbyAudio.baseUrl || dolbyAudio.backupUrl?.[0] || "",
          videoUrl,
          videoResolution: `${bestVideoInfo?.width}x${bestVideoInfo?.height}`,
        };
      }
    }

    const audioList = getUrlInfoRes?.data?.dash?.audio || [];
    const selectedAudio = selectAudioByQuality(audioList, audioQuality);
    return {
      isLossless: false,
      audioCodecs: selectedAudio?.codecs?.toLowerCase() || "",
      audioBandwidth: selectedAudio?.bandwidth,
      audioUrl: selectedAudio?.baseUrl || selectedAudio?.backupUrl?.[0] || "",
      videoUrl,
      videoResolution,
    };
  } catch (error) {
    log.error("[Get video play url error]", error);
    return {
      isLossless: false,
    };
  }
}

/**
 * 登录情况下获取音乐播放链接
 */
export const getAudioUrl = async (sid: number | string) => {
  const res = await getAudioWebStreamUrl({
    songid: sid,
    quality: useUser.getState().user?.vipStatus ? 3 : 2,
    privilege: 2,
    mid: useUser.getState().user?.mid || 0,
    platform: "web",
  });

  const isFlac = res?.data?.type === 3;

  return {
    audioUrl: res?.data?.cdns?.[0],
    audioCodecs: isFlac ? "flac" : "",
    isLossless: isFlac,
  };
};

/** URL是否有效 */
export const isUrlValid = (url?: string): url is string => {
  return Boolean(url) && moment().isBefore(moment.unix(Number(getUrlParams(url as string).deadline)));
};
