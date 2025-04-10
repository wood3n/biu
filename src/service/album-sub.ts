import request from "./request";

export enum AlbumSubState {
  /* 收藏 */
  Subscribed = 1,
  /* 取消收藏 */
  Unsubscribed = 2,
}

export interface AlbumSubRequestParams {
  id: string | undefined;
  /** 1 为收藏, 2 取消收藏 */
  t: AlbumSubState;
}

/*
 * 收藏/取消收藏专辑
 */
export const getAlbumSub = (params: AlbumSubRequestParams) => request.get("/album/sub", { params });
