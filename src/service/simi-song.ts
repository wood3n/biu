import request from "./request";

export interface SimiSongRequestParams {
  id: number | undefined;
}

/*
 * 获取相似音乐
 */
export const getSimiSong = (params: SimiSongRequestParams) => request.get("/simi/song", { params });
