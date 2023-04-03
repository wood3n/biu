import request from './request';

export interface ArtistDescRequestParams {
  id: string | undefined;
}

/*
 * 获取歌手描述（deprecated）
 */
export const getArtistDesc = (params: ArtistDescRequestParams) => request.get('/artist/desc', { params });
