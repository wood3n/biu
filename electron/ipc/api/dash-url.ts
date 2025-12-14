import got from "got";

import type { PlayerPlayurlRequestParams, PlayerPlayurlResponse } from "./types";

import { getCookieString } from "../../network/cookie";
import { UserAgent } from "../../network/user-agent";
import { encodeParamsWbi } from "./wbi";

export const getDashurl = async (params: PlayerPlayurlRequestParams) => {
  const cookie = await getCookieString();
  const wbiParams = await encodeParamsWbi(params, cookie);

  const response = await got.get("https://api.bilibili.com/x/player/wbi/playurl", {
    searchParams: wbiParams,
    headers: {
      Cookie: cookie,
      Referer: "https://www.bilibili.com/",
      Origin: "https://www.bilibili.com",
      "User-Agent": UserAgent,
    },
    responseType: "json",
  });

  return response.body as PlayerPlayurlResponse;
};
