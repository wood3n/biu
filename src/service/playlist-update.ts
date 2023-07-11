import request from './request';

export interface PlaylistUpdateRequestData {
  id: number | undefined;
  name: string | undefined;
  desc: string | undefined;
  tags: string[] | undefined;
}

/*
 * 更新歌单
 */
export const postPlaylistUpdate = (data: PlaylistUpdateRequestData) => request.post('/playlist/update', data);
