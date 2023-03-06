import request from './request';

export interface PlaylistTracksRequestData {
  op: string | undefined;
  pid: number | undefined;
  tracks: number[] | undefined;
}

/*
 * 对歌单添加或删除歌曲
 */
export const postPlaylistTracks = (data: PlaylistTracksRequestData) => request.post('/playlist/tracks', data);
