import request from "./request";

export interface DjPersonalizeRecommendRequestParams {
  limit: number | undefined;
}

/*
 * 电台个性推荐
 */
export const getDjPersonalizeRecommend = (params: DjPersonalizeRecommendRequestParams) => request.get("/dj/personalize/recommend", { params });
