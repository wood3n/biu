import request from './request';

export interface albumRequestParams {
  id: number | undefined;
}

/*
 * 获取专辑内容
 */
export const getalbum = (params: albumRequestParams) => request.get('/album', { params });
