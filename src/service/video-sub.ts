import request from "./request";

export interface VideoSubRequestParams {
  id: number | undefined;
  t: number | undefined;
}

/*
 * 收藏/取消收藏视频，t : 1 为收藏,其他为取消收藏
 */
export const getVideoSub = (params: VideoSubRequestParams) => request.get("/video/sub", { params });
