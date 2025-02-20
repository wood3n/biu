import request from "./request";

export interface PlaylistSubscribeRequestParams {
  id: string | number | undefined;
  t: number | undefined;
}

/*
 * 收藏/取消收藏歌单；t：1-收藏,2-取消收藏
 */
export const getPlaylistSubscribe = (params: PlaylistSubscribeRequestParams) => request.get("/playlist/subscribe", { params });
