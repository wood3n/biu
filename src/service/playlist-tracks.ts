import request from "./request";

export interface PlaylistTracksRequestData {
  /** 从歌单增加单曲为 add, 删除为 del */
  op: "add" | "del" | undefined;
  pid: number | undefined;
  tracks: string | undefined;
}

/*
 * 对歌单添加或删除歌曲
 */
export const postPlaylistTracks = (params: PlaylistTracksRequestData) => request.get("/playlist/tracks", { params });
