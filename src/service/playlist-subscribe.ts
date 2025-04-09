import request from "./request";

export enum SubscribeState {
  /** 取消收藏 */
  Unsubscribed = 2,
  /** 收藏 */
  Subscribed = 1,
}

export interface PlaylistSubscribeRequestParams {
  id: string | number | undefined;
  /** 1:收藏；2:取消收藏 */
  t: SubscribeState;
}

/*
 * 收藏/取消收藏歌单；t：1-收藏,2-取消收藏
 */
export const getPlaylistSubscribe = (params: PlaylistSubscribeRequestParams) =>
  request.get("/playlist/subscribe", { params });
