import request from './request';

export interface SearchMultimatchRequestParams {
  keywords: string | undefined;
}

/*
 * 搜索多重匹配
 */
export const getSearchMultimatch = (params: SearchMultimatchRequestParams) => request.get('/search/multimatch', { params });
