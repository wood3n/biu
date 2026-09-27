import type { BBPInviteCodeResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 旋转邀请码 - 请求参数 */
export interface BBPPlaylistInviteRotateParams {
  id: string;
}

/**
 * 旋转（重置）邀请码（仅 owner）
 * @param params 请求参数
 * @returns Promise<BBPInviteCodeResponse>
 */
export const bbpPlaylistInviteRotate = ({ id }: BBPPlaylistInviteRotateParams) => {
  return bbpRequest.post<BBPInviteCodeResponse>(`/playlists/${id}/invite/rotate`);
};
