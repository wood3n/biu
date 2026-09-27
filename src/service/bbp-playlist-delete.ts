import type { BBPPlaylistDeleteResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 删除歌单 - 请求参数 */
export interface BBPPlaylistDeleteParams {
  id: string;
}

/**
 * 删除歌单（仅 owner）
 * @param params 请求参数
 * @returns Promise<BBPPlaylistDeleteResponse>
 */
export const bbpPlaylistDelete = ({ id }: BBPPlaylistDeleteParams) => {
  return bbpRequest.delete<BBPPlaylistDeleteResponse>(`/playlists/${id}`);
};
