import request from "./request";

export interface PlaylistTrackDeleteRequestData {
  pid: number | undefined;
  ids: number[] | undefined;
}

/*
 * 删除视频歌单里的视频
 */
export const postPlaylistTrackDelete = (data: PlaylistTrackDeleteRequestData) => request.post("/playlist/track/delete", data);
