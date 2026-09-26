import type { BBPSubscribeResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 订阅歌单 - 请求参数 */
export interface BBPPlaylistSubscribeParams {
  id: string;
  invite_code?: string;
}

/**
 * 订阅歌单（加入）
 * @param params 请求参数
 * @returns Promise<BBPSubscribeResponse>
 */
export const bbpPlaylistSubscribe = ({ id, ...body }: BBPPlaylistSubscribeParams) => {
  return bbpRequest.post<BBPSubscribeResponse>(`/playlists/${id}/subscribe`, body);
};
