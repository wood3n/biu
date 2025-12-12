import got from "got";

import type { AudioStreamUrlResponse } from "./types";

import { getCookieString } from "../../network/cookie";
import { UserAgent } from "../../network/user-agent";
import { userStore } from "../../store";

export const getAudioWebStreamUrl = async (songid: string) => {
  const cookie = await getCookieString();
  const mid = userStore.get("mid") || "";
  const vipStatus = userStore.get("vipStatus") || 2;

  const response = await got.get("https://www.bilibili.com/audio/music-service-c/web/url", {
    searchParams: {
      mid: mid,
      songid,
      quality: vipStatus ? 3 : 2,
      privilege: 2,
      platform: "web",
    },
    headers: {
      Cookie: cookie,
      Referer: "https://www.bilibili.com/",
      Origin: "https://www.bilibili.com",
      "User-Agent": UserAgent,
    },
    responseType: "json",
  });

  return response.body as AudioStreamUrlResponse;
};
