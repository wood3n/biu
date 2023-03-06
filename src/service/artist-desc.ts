import request from './request';

export interface ArtistDescRequestParams {
  id: number | undefined;
}

/*
 * 获取歌手描述
 */
export const getArtistDesc = (params: ArtistDescRequestParams) => request.get('/artist/desc', { params });
