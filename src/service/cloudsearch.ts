import request from './request';

export interface cloudsearchRequestParams {
  keywords: string | undefined;
  limit: number | undefined;
  type: number | undefined;
}

/*
 * 传入搜索关键词可以搜索该音乐 / 专辑 / 歌手 / 歌单 / 用户, 关键词可以多个, 以空格隔开
 */
export const getCloudsearch = (params: cloudsearchRequestParams) => request.get('/cloudsearch', { params });
