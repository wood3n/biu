import request from './request';

export interface AlbumSubRequestParams {
  id: number | undefined;
  t: number | undefined;
}

/*
 * 收藏/取消收藏专辑；t : 1 为收藏,其他为取消收藏
 */
export const getAlbumSub = (params: AlbumSubRequestParams) => request.get('/album/sub', { params });
