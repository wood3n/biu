import { apiRequest } from "./request";

export interface GetSpaceSettingsParams {
  mid: string | number;
  /** 333.1387 */
  web_location: string;
}

export interface GetSpaceSettingsResponse {
  code: number;
  message: string;
  ttl: number;
  data: Data;
}

export interface Data {
  privacy: Privacy;
  show_nft_switch: boolean;
  index_order: IndexOrder[];
}

/**
 * 0：隐藏 1：公开
 */
export interface Privacy {
  bangumi: number;
  bbq: number;
  channel: number;
  charge_video: number;
  close_space_medal: number;
  coins_video: number;
  comic: number;
  disable_following: number;
  disable_show_fans: number;
  disable_show_school: number;
  dress_up: number;
  /** 收藏夹 */
  fav_video: number;
  groups: number;
  lesson_video: number;
  likes_video: number;
  live_playback: number;
  only_show_wearing: number;
  played_game: number;
  tags: number;
  user_info: number;
}

export interface IndexOrder {
  id: number;
  name: string;
}

export const getXSpaceSettings = (params: GetSpaceSettingsParams) => {
  return apiRequest.get<GetSpaceSettingsResponse>("/x/space/setting", { params });
};
