import request from './request';

export interface SongUrlRequestParams {
  id: number | undefined;
  br: number | undefined;
}

/*
 * 获取音乐 url
 */
export const getSongUrl = (params: SongUrlRequestParams) => request.get('/song/url', { params });
