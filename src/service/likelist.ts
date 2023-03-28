import request from './request';

export interface likelistRequestParams {
  uid: number | undefined;
}

export interface LikelistResponse {
  code: number;
  checkPoint: number;
  ids: number[];
}

/*
 * 喜欢的音乐列表id
 */
export const getLikelist = (params: likelistRequestParams) => request.get<LikelistResponse>('/likelist', { params });
