import type { BBPChange } from "./bbp-types";

import { bbpRequest } from "./request";

/** 提交歌单变更 - 请求参数 */
export interface BBPPlaylistChangesSubmitParams {
  id: string;
  changes: BBPChange[];
}

/** 提交歌单变更 - 响应 */
export interface BBPPlaylistChangesSubmitResponse {
  applied_at: number;
}

/**
 * 提交歌单变更（增量同步-写，owner / editor）
 * @param params 请求参数
 * @returns Promise<BBPPlaylistChangesSubmitResponse>
 */
export const bbpPlaylistChangesSubmit = ({ id, changes }: BBPPlaylistChangesSubmitParams) => {
  return bbpRequest.post<BBPPlaylistChangesSubmitResponse>(`/playlists/${id}/changes`, { changes });
};
