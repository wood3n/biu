import { UserAgent } from "./user-agent";

export interface WebBuvidResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -404:无视频
  message: string; // 错误信息
  ttl: number; // 1
  data: WebBuvidData;
}

export interface WebBuvidData {
  b_3: string; // buvid3
  b_4: string; // buvid4
}

/**
 * 获取buvid
 */
export const getWebBuvid = async () => {
  const response = await fetch("https://api.bilibili.com/x/frontend/finger/spi_v2", {
    method: "GET",
    headers: {
      "User-Agent": UserAgent,
    },
  });

  const data = (await response.json()) as WebBuvidResponse;

  return data.data;
};
