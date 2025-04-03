import request from "./request";

export interface PlaylistOrderUpdateRequestData {
  ids: number[] | undefined;
}

/*
 * 调整歌单顺序
 */
export const postPlaylistOrderUpdate = (data: PlaylistOrderUpdateRequestData) =>
  request.post("/playlist/order/update", data);
