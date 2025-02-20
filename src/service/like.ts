import request from "./request";

export interface LikeRequestData {
  id: number | undefined;
  /**
   * 默认为 true 即喜欢 , 若传 false, 则取消喜欢
   */
  like?: boolean | undefined;
}

/*
 * 喜欢音乐
 */
export const postLike = (data: LikeRequestData) => request.post("/like", data);
