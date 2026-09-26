import type { BBPMePlaylistsResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/**
 * 获取当前用户参与的所有共享歌单
 * @returns Promise<BBPMePlaylistsResponse>
 */
export const bbpMePlaylists = () => {
  return bbpRequest.get<BBPMePlaylistsResponse>("/me/playlists");
};
