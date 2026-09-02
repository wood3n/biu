import type { BBPPlaylistLeaveResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 退出歌单 - 请求参数 */
export interface BBPPlaylistLeaveParams {
  id: string;
}

/**
 * 退出歌单（非 owner）
 * @param params 请求参数
 * @returns Promise<BBPPlaylistLeaveResponse>
 */
export const bbpPlaylistLeave = ({ id }: BBPPlaylistLeaveParams) => {
  return bbpRequest.delete<BBPPlaylistLeaveResponse>(`/playlists/${id}/members/me`);
};
