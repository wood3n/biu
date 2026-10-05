import type { BBPPlaylistMembersResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 获取歌单成员列表 - 请求参数 */
export interface BBPPlaylistMembersParams {
  id: string;
}

/**
 * 获取歌单成员列表（owner / editor）
 * @param params 请求参数
 * @returns Promise<BBPPlaylistMembersResponse>
 */
export const bbpPlaylistMembers = ({ id }: BBPPlaylistMembersParams) => {
  return bbpRequest.get<BBPPlaylistMembersResponse>(`/playlists/${id}/members`);
};
