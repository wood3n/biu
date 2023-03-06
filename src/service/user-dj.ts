import request from './request';

export interface UserDjRequestParams {
  uid: number | undefined;
}

/*
 * 获取用户电台
 */
export const getUserDj = (params: UserDjRequestParams) => request.get('/user/dj', { params });
