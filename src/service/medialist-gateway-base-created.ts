import { apiRequest } from "./request";

interface MedialistGatewayBaseCreatedRequestParams {
  /** 分页页码 */
  pn: number;
  /** 分页大小,可以是100 */
  ps: number;
  /** 音乐 id */
  rid: string | number;
  /** 12 表示音频 */
  type: number | string;
  /** 登录用户的 mid */
  up_mid: string | number;
}

export interface MedialistGatewayBaseCreatedResponse {
  code: number;
  data: Data;
  message: string;
}

export interface Data {
  count: number;
  list: List[];
}

export interface List {
  attr: number;
  cnt_info: CntInfo;
  cover: string;
  cover_type: number;
  ctime: number;
  fav_state: number;
  fid: number;
  id: number;
  intro: string;
  like_state: number;
  media_count: number;
  mid: number;
  mtime: number;
  state: number;
  title: string;
  type: number;
}

export interface CntInfo {
  coin: number;
  collect: number;
  danmaku: number;
  play: number;
  reply: number;
  share: number;
  thumb_down: number;
  thumb_up: number;
}

/**
 * 根据B站音乐获取收藏夹信息
 */
export const getAudioCreatedFavList = (params: MedialistGatewayBaseCreatedRequestParams) => {
  return apiRequest.get<MedialistGatewayBaseCreatedResponse>("/medialist/gateway/base/created", { params });
};
