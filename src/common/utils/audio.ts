import { addToast } from "@heroui/react";
import log from "electron-log/renderer";
import moment from "moment";

import { getAudioWebStreamUrl } from "@/service/audio-web-url";
import { getPassportLoginCaptcha } from "@/service/passport-login-captcha";
import { getPlayerPlayurl, type DashAudio } from "@/service/player-playurl";
import { useUser } from "@/store/user";

import { audioQualitySort } from "../constants/audio";
import { VideoFnval } from "../constants/video";
import { getUrlParams } from "./url";

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

interface GeetestResult {
  validate: string;
  seccode: string;
  challenge: string;
  token: string;
  gt: string;
}

const loadGeetestScript = () => {
  if (typeof window.initGeetest === "function") return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://static.geetest.com/static/tools/gt.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Geetest script"));
    document.body.appendChild(script);
  });
};

const verifyGeetest = async (): Promise<GeetestResult | null> => {
  try {
    await loadGeetestScript();

    const res = await getPassportLoginCaptcha();
    if (res.code !== 0 || !res.data.geetest) {
      addToast({ title: res.message || "获取验证码失败", color: "danger" });
      return null;
    }

    const { gt, challenge } = res.data.geetest;
    const { token } = res.data;

    return new Promise<GeetestResult | null>(resolve => {
      if (typeof window.initGeetest !== "function") {
        addToast({ title: "极验组件加载失败", color: "danger" });
        resolve(null);
        return;
      }

      window.initGeetest(
        {
          gt,
          challenge,
          offline: false,
          new_captcha: true,
          product: "bind",
          https: true,
        },
        (captchaObj: any) => {
          captchaObj.onReady(() => {
            captchaObj.verify();
          });
          captchaObj.onSuccess(() => {
            const result = captchaObj.getValidate();
            if (result && typeof result !== "boolean") {
              resolve({
                validate: result.geetest_validate || "",
                seccode: result.geetest_seccode || "",
                challenge: result.geetest_challenge || challenge,
                token,
                gt,
              });
            } else {
              resolve(null);
            }
          });
          captchaObj.onError((e: any) => {
            console.error("Geetest Error:", e);
            addToast({ title: "验证出错", color: "danger" });
            resolve(null);
          });

          if (captchaObj.onClose) {
            captchaObj.onClose(() => {
              resolve(null);
            });
          }
        },
      );
    });
  } catch (e: any) {
    addToast({ title: e.message || "验证过程异常", color: "danger" });
    return null;
  }
};

export async function getDashUrl(bvid: string, cid: string | number, audioQuality: AudioQuality = "auto") {
  try {
    let getUrlInfoRes = await getPlayerPlayurl({
      bvid,
      cid,
      fnval: VideoFnval.AllDash,
    });

    if (getUrlInfoRes?.data?.v_voucher) {
      const geetestRes = await verifyGeetest();
      if (geetestRes) {
        getUrlInfoRes = await getPlayerPlayurl({
          bvid,
          cid,
          fnval: VideoFnval.AllDash,
          ...geetestRes,
        });
      }
    }

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
