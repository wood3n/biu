import request from './request';

export interface PlaylistDeleteRequestData {
  id: number[] | undefined;
}

/*
 * 删除歌单；多个歌单id用逗号隔开
 */
export const postPlaylistDelete = (data: PlaylistDeleteRequestData) => request.post('/playlist/delete', data);
