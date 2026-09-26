import type { BBPInviteCodeResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 获取编辑者邀请码 - 请求参数 */
export interface BBPPlaylistInviteParams {
  id: string;
}

/**
 * 获取编辑者邀请码（仅 owner）
 * @param params 请求参数
 * @returns Promise<BBPInviteCodeResponse>
 */
export const bbpPlaylistInvite = ({ id }: BBPPlaylistInviteParams) => {
  return bbpRequest.get<BBPInviteCodeResponse>(`/playlists/${id}/invite`);
};
