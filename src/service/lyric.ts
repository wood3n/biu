import request from './request';

export interface lyricRequestParams {
  id: number | undefined;
}

/*
 * 获取歌词
 */
export const getlyric = (params: lyricRequestParams) => request.get('/lyric', { params });
