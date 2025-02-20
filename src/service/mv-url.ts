import request from "./request";

export interface MvUrlRequestParams {
  id: number | undefined;
  r: number | undefined;
}

/*
 * 获取对应 MV 播放地址
 */
export const getMvUrl = (params: MvUrlRequestParams) => request.get("/mv/url", { params });
