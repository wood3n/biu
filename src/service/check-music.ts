import request from './request';

export interface CheckMusicRequestParams {
  id: number | undefined;
  br: number | undefined;
}

/*
 * 音乐是否可用
 */
export const getCheckMusic = (params: CheckMusicRequestParams) => request.get('/check/music', { params });
