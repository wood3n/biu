import request from './request';

export interface SongUrlV1RequestParams {
  id: number | undefined;
  level: string | undefined;
}

/*
 * 获取音乐 url - 新版
 */
export const getSongUrlV1 = (params: SongUrlV1RequestParams) => request.get('/song/url/v1', { params });
