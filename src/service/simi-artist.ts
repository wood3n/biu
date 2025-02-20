import request from "./request";

export interface SimiArtistRequestParams {
  id: number | undefined;
}

/*
 * 获取相似歌手
 */
export const getSimiArtist = (params: SimiArtistRequestParams) => request.get("/simi/artist", { params });
