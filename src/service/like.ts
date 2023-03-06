import request from './request';

export interface likeRequestParams {
  id: number | undefined;
  like: boolean | undefined;
}

/*
 * 喜欢音乐
 */
export const getlike = (params: likeRequestParams) => request.get('/like', { params });
