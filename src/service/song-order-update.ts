import request from "./request";

export interface SongOrderUpdateRequestData {
  pid: number | undefined;
  ids: number[] | undefined;
}

/*
 * 调整歌曲顺序
 */
export const postSongOrderUpdate = (data: SongOrderUpdateRequestData) => request.post("/song/order/update", data);
