import request from "./request";

export interface RelatedPlaylistRequestParams {
  id: number | undefined;
}

/*
 * 相关歌单推荐，传入歌单 id
 */
export const getRelatedPlaylist = (params: RelatedPlaylistRequestParams) =>
  request.get("/related/playlist", { params });
