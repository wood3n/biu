import request from './request';

export interface SimiMvRequestParams {
  mvid: number | undefined;
}

/*
 * 获取相似 mv
 */
export const getSimiMv = (params: SimiMvRequestParams) => request.get('/simi/mv', { params });
