import request from "./request";

export interface personalizedRequestParams {
  limit: number | undefined;
}

/*
 * 推荐歌单
 */
export const getpersonalized = (params: personalizedRequestParams) => request.get("/personalized", { params });
