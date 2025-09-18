import { apiRequest } from "./request";

// 请求参数（与 service.md 保持一致）
export interface Params {
  /** 页码，默认 1 */
  pn?: number;
  /** 每页数量，默认 20 */
  ps?: number;
  /** 默认 333.1351 */
  web_location?: string;
}

// 关联稿件信息
export interface RelatedArchive {
  aid: string;
  bvid: string;
  cid: string;
  cover: string;
  title: string;
  uid: number;
  username: string;
  vt_display: string;
  vv_count: number;
  is_vt: number;
  fname: string;
  duration: number;
}

// 列表项数据结构
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
  score: number;
  related_archive: RelatedArchive;
}

// 接口返回值结构
export interface Response {
  code: number;
  message: string;
  ttl: number;
  data: {
    list: Data[];
  };
}

/**
 * 更多音乐推荐
 * GET /x/centralization/interface/music/comprehensive/web/rank
 */
export const getMusicComprehensiveWebRank = (params: Params) => {
  return apiRequest.get<Response>("/x/centralization/interface/music/comprehensive/web/rank", { params });
};
