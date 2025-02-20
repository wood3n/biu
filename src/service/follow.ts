import request from "./request";

export interface followRequestParams {
  id: number | undefined;
  t: number | undefined;
}

/*
 * 关注/取消关注用户，t : 1为关注,其他为取消关注
 */
export const getfollow = (params: followRequestParams) => request.get("/follow", { params });
