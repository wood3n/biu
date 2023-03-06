import request from './request';

export interface AlbumSublistRequestParams {
  limit: number | undefined;
  offset: number | undefined;
}

/*
 * 获取已收藏专辑列表
 */
export const getAlbumSublist = (params: AlbumSublistRequestParams) => request.get('/album/sublist', { params });
