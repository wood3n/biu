import request from './request';

export interface SongDetailRequestParams {
  ids: string | undefined;
}

/*
 * 获取歌曲详情，多个 id用逗号隔开
 */
export const getSongDetail = (params: SongDetailRequestParams) => request.get('/song/detail', { params });
