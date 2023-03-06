import request from './request';

export interface PlaylistTrackAllRequestParams {
  id: number | undefined;
  limit: number | undefined;
  offset: number | undefined;
}

/*
 * 获取歌单所有歌曲
 */
export const getPlaylistTrackAll = (params: PlaylistTrackAllRequestParams) => request.get('/playlist/track/all', { params });
