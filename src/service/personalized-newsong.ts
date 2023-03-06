import request from './request';

export interface PersonalizedNewsongRequestParams {
  limit: number | undefined;
}

/*
 * 推荐新音乐
 */
export const getPersonalizedNewsong = (params: PersonalizedNewsongRequestParams) => request.get('/personalized/newsong', { params });
