import request from "./request";

export interface MvDetailRequestParams {
  mvid: number | undefined;
}

/*
 * 获取对应 MV 数据 , 数据包含 mv 名字 , 歌手 , 发布时间 , mv 视频地址等数据
 */
export const getMvDetail = (params: MvDetailRequestParams) => request.get("/mv/detail", { params });
