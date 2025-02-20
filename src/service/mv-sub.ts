import request from "./request";

export interface MvSubRequestParams {
  mvid: number | undefined;
  t: number | undefined;
}

/*
 * 收藏/取消收藏MV，t : 1 为收藏,其他为取消收藏
 */
export const getMvSub = (params: MvSubRequestParams) => request.get("/mv/sub", { params });
