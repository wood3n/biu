import request from "./request";

export interface ArtistMvRequestParams {
  id: number | undefined;
}

/*
 * 获取歌手 mv
 */
export const getArtistMv = (params: ArtistMvRequestParams) => request.get("/artist/mv", { params });
