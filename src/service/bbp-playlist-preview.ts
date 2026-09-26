import type { BBPPlaylistPreview } from "./bbp-types";

import { bbpRequest } from "./request";

/** 歌单预览 - 请求参数 */
export interface BBPPlaylistPreviewParams {
  id: string;
}

/**
 * 获取歌单预览（公开）
 * @param params 请求参数
 * @returns Promise<BBPPlaylistPreview>
 */
export const bbpPlaylistPreview = ({ id }: BBPPlaylistPreviewParams) => {
  return bbpRequest.get<BBPPlaylistPreview>(`/playlists/${id}/preview`, { skipAuth: true });
};
