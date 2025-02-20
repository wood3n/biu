import request from "./request";

export interface SimiPlaylistRequestParams {
  id: number | undefined;
}

/*
 * 获取相似歌单
 */
export const getSimiPlaylist = (params: SimiPlaylistRequestParams) => request.get("/simi/playlist", { params });
