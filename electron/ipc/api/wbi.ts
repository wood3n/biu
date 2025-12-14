import got from "got";
import { createHash } from "node:crypto";

import { UserAgent } from "../../network/user-agent";

const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41,
  13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34,
  44, 52,
];

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const getMixinKey = (orig: string) =>
  MIXIN_KEY_ENC_TAB.map(n => orig[n])
    .join("")
    .slice(0, 32);

// 获取最新的 img_key 和 sub_key
const getWbiKeys = async (cookie: string) => {
  try {
    const { body } = await got.get("https://api.bilibili.com/x/web-interface/nav", {
      headers: {
        Cookie: cookie,
        "User-Agent": UserAgent,
        Referer: "https://www.bilibili.com/",
      },
      responseType: "json",
    });

    const data = (body as any).data;
    const { img_url, sub_url } = data.wbi_img || {};

    return {
      img_key: img_url?.slice(img_url.lastIndexOf("/") + 1, img_url.lastIndexOf(".")),
      sub_key: sub_url?.slice(sub_url.lastIndexOf("/") + 1, sub_url.lastIndexOf(".")),
    };
  } catch (error) {
    console.error("Failed to get Wbi keys:", error);
    return { img_key: "", sub_key: "" };
  }
};

// 为请求参数进行 wbi 签名
export const encodeParamsWbi = async (params: Record<string, any>, cookie: string) => {
  const { img_key, sub_key } = await getWbiKeys(cookie);

  if (!img_key || !sub_key) {
    return params;
  }

  const mixin_key = getMixinKey(img_key + sub_key);
  const curr_time = Math.round(Date.now() / 1000);
  const chr_filter = /[!'()*]/g;

  // 添加 wts 字段
  const newParams = { ...params, wts: curr_time };

  // 按照 key 重排参数
  const query = Object.keys(newParams)
    .sort()
    .map(key => {
      // 过滤 value 中的 "!'()*" 字符
      const value = newParams[key].toString().replace(chr_filter, "");
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

  const wbiSign = createHash("md5")
    .update(query + mixin_key)
    .digest("hex");
  return { ...newParams, w_rid: wbiSign };
};
