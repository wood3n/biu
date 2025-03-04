import request from "./request";

export interface AlbumSubRequestParams {
  id: string | undefined;
  /** 1 为收藏,其他为取消收藏 */
  t: number | undefined;
}

/*
 * 收藏/取消收藏专辑
 */
export const getAlbumSub = (params: AlbumSubRequestParams) => request.get("/album/sub", { params });
