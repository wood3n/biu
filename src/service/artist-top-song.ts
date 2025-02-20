import request from "./request";

export interface ArtistTopSongRequestParams {
  id: number | undefined;
}

/*
 * 歌手热门 50 首歌曲
 */
export const getArtistTopSong = (params: ArtistTopSongRequestParams) => request.get("/artist/top/song", { params });
