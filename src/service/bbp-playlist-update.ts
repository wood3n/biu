import type { BBPPlaylistDetailResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 更新歌单元信息 - 请求参数 */
export interface BBPPlaylistUpdateParams {
  id: string;
  title?: string;
  description?: string;
  cover_url?: string;
}

/**
 * 更新歌单元信息（仅 owner）
 * @param params 更新参数
 * @returns Promise<BBPPlaylistDetailResponse>
 */
export const bbpPlaylistUpdate = ({ id, ...body }: BBPPlaylistUpdateParams) => {
  return bbpRequest.patch<BBPPlaylistDetailResponse>(`/playlists/${id}`, body);
};
