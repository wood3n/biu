import request from './request';

export interface PlaylistTrackAddRequestData {
  pid: number | undefined;
  ids: number[] | undefined;
}

/*
 * 收藏视频到视频歌单
 */
export const postPlaylistTrackAdd = (data: PlaylistTrackAddRequestData) => request.post('/playlist/track/add', data);
