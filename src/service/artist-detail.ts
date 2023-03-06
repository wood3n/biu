import request from './request';

export interface ArtistDetailRequestParams {
  id: number | undefined;
}

/*
 * 获取歌手详情
 */
export const getArtistDetail = (params: ArtistDetailRequestParams) => request.get('/artist/detail', { params });
