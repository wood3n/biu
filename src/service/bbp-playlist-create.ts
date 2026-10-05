import type { BBPPlaylistDetailResponse, BBPTrackInputItem } from "./bbp-types";

import { bbpRequest } from "./request";

/** 创建歌单 - 请求参数 */
export interface BBPPlaylistCreateParams {
  title: string;
  description?: string;
  cover_url?: string;
  tracks?: BBPTrackInputItem[];
}

/**
 * 创建歌单
 * @param params 创建参数
 * @returns Promise<BBPPlaylistDetailResponse>
 */
export const bbpPlaylistCreate = (params: BBPPlaylistCreateParams) => {
  return bbpRequest.post<BBPPlaylistDetailResponse>("/playlists", params);
};
