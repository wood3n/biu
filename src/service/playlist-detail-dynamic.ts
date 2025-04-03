import request from "./request";

export interface PlaylistDetailDynamicRequestParams {
  id: number | undefined;
}

/*
 * 歌单详情动态，如评论数,是否收藏,播放数
 */
export const getPlaylistDetailDynamic = (params: PlaylistDetailDynamicRequestParams) =>
  request.get("/playlist/detail/dynamic", { params });
