import request from "./request";

export interface ArtistAlbumRequestParams {
  id: number | undefined;
  limit: number | undefined;
  offset: number | undefined;
}

/*
 * 获取歌手专辑
 */
export const getArtistAlbum = (params: ArtistAlbumRequestParams) => request.get("/artist/album", { params });
