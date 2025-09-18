import { apiRequest } from "./request";

/** 查询参数：根据文档，level_source 仅给出 1 表示“全部” */
export interface Params {
  /** 分类来源，1：全部 */
  level_source: 1;
}

/** 音乐人条目结构（与 service.md 示例返回一致） */
export interface Musician {
  id: number;
  aid: string;
  bvid: string;
  archive_count: number;
  fans_count: number;
  cover: string;
  desc: string;
  duration: number;
  pub_time: number;
  danmu_count: number;
  self_intro: string;
  title: string;
  uid: string;
  vt_display: string;
  vv_count: number;
  is_vt: number;
  username: string;
  user_profile: string;
  user_level: number;
  lightning: number;
}

/** 接口返回值结构（与 service.md 示例返回一致） */
export interface Response {
  code: number;
  message: string;
  ttl: number;
  data: {
    musicians: Musician[];
  };
}

/**
 * 查询推荐音乐人
 * GET /x/centralization/interface/musician/list
 */
export const getMusicianList = (params: Params) => {
  return apiRequest.get<Response>("/x/centralization/interface/musician/list", { params });
};
