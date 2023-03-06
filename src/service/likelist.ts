import request from './request';

export interface likelistRequestParams {
  uid: number | undefined;
}

/*
 * 喜欢的音乐列表
 */
export const getlikelist = (params: likelistRequestParams) => request.get('/likelist', { params });
