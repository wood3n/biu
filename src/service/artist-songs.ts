import request from './request';

export interface ArtistSongsRequestParams {
  order: string | undefined;
  id: number | undefined;
  limit: number | undefined;
  offset: number | undefined;
}

/*
 * 歌手全部歌曲
 */
export const getArtistSongs = (params: ArtistSongsRequestParams) => request.get('/artist/songs', { params });
