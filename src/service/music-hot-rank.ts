import { apiRequest } from "./request";

interface Params {
  /** web热榜为2 */
  plat: number;
  /** 333.1351 */
  web_location: string;
}

export interface Data {
  music_title: string;
  music_id: string;
  music_corner: string;
  cid: string;
  jump_url: string;
  author: string;
  bvid: string;
  album: string;
  aid: string;
  id: number;
  cover: string;
  total_vv: number;
  wish_count: number;
  source: string;
}

export interface Response {
  code: number; // 返回值，0表示成功
  message: string; // 错误信息
  data: {
    list: Data[];
  };
}

export const getMusicHotRank = (params: Params) => {
  return apiRequest.get<Response>("/x/centralization/interface/music/hot/rank", { params });
};
