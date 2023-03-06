import request from './request';

export interface PlaylistDetailRequestParams {
  id: number | undefined;
  s: number | undefined;
}

/*
 * 获取歌单详情
 */
export const getPlaylistDetail = (params: PlaylistDetailRequestParams) => request.get('/playlist/detail', { params });
