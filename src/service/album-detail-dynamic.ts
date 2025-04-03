import request from "./request";

export interface AlbumDetailDynamicRequestParams {
  id: number | undefined;
}

/*
 * 获得专辑动态信息,如是否收藏,收藏数,评论数,分享数
 */
export const getAlbumDetailDynamic = (params: AlbumDetailDynamicRequestParams) =>
  request.get("/album/detail/dynamic", { params });
