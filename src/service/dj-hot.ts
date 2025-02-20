import request from "./request";

export interface DjHotRequestParams {
  limit: number | undefined;
  offset: number | undefined;
}

/*
 * 热门电台
 */
export const getDjHot = (params: DjHotRequestParams) => request.get("/dj/hot", { params });
