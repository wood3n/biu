import request from "./request";

export enum ArtistSubState {
  /** 未收藏 */
  Unsub = 0,
  /** 收藏 */
  Sub = 1,
}

export interface ArtistSubRequestParams {
  id: string | undefined;
  /** 1 为收藏,其他为取消收藏 */
  t: ArtistSubState | undefined;
}

/*
 * 收藏/取消收藏歌手
 */
export const getArtistSub = (params: ArtistSubRequestParams) => request.get("/artist/sub", { params });
