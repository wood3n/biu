import request from "./request";

export interface ArtistTopSongRequestParams {
  id: string | undefined;
}

export interface ArtistTopSongResponse {
  code: number;
  songs: Song[];
}

/*
 * 歌手热门 50 首歌曲
 */
export const getArtistTopSong = (params: ArtistTopSongRequestParams) =>
  request.get<ArtistTopSongResponse>("/artist/top/song", { params });
