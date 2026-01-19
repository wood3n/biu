import { apiRequest } from "./request";

interface WebRegionFeedRcmdParams {
  /** 页码 */
  display_id: number;
  /** 分页大小，15 */
  request_cnt: number;
  /** 音乐分区，1003；鬼畜：1007；参考https://socialsisteryi.github.io/bilibili-API-collect/docs/video/video_zone_v2.html#%E9%9F%B3%E4%B9%90 */
  from_region: number;
  device: "web";
  /** 30 */
  plat: number;
  /** 333.40138 */
  web_location: string;
}

export interface WebDynamicResponse {
  code?: number;
  message?: string;
  ttl?: number;
  data?: Data;
}

export interface Data {
  archives?: Archive[];
}

export interface Archive {
  aid?: number;
  bvid?: string;
  cid?: number;
  title?: string;
  cover: string;
  duration?: number;
  pubdate?: number;
  stat?: Stat;
  author?: Author;
  trackid?: string;
  goto?: "av";
  rec_reason?: string;
}

export interface Author {
  mid?: number;
  name?: string;
}

export interface Stat {
  view?: number;
  like?: number;
  danmaku?: number;
}

export function getRegionFeedRcmd(params: WebRegionFeedRcmdParams) {
  return apiRequest.get<WebDynamicResponse>("/x/web-interface/region/feed/rcmd", {
    params,
    useWbi: true,
  });
}
