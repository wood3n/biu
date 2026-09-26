import type { BBPChangesResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 拉取歌单变更 - 请求参数 */
export interface BBPPlaylistChangesPullParams {
  id: string;
  since: number;
}

/**
 * 拉取歌单变更（增量同步-读，owner / editor / subscriber）
 * @param params 请求参数
 * @returns Promise<BBPChangesResponse>
 */
export const bbpPlaylistChangesPull = ({ id, since }: BBPPlaylistChangesPullParams) => {
  return bbpRequest.get<BBPChangesResponse>(`/playlists/${id}/changes`, { params: { since } });
};
