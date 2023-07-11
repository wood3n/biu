import request from './request';

export interface ArtistSubRequestParams {
  id: number | undefined;
  t: number | undefined;
}

/*
 * 收藏/取消收藏歌手，t:操作,1 为收藏,其他为取消收藏
 */
export const getArtistSub = (params: ArtistSubRequestParams) => request.get('/artist/sub', { params });
