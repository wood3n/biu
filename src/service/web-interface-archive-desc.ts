import { apiRequest } from "./request";

/**
 * 获取视频简介 - 请求参数
 */
export interface WebInterfaceArchiveDescRequestParams {
  aid?: number; // 稿件avid
  bvid?: string; // 稿件bvid
}

/**
 * 获取视频简介 - 响应类型
 */
export interface WebInterfaceArchiveDescResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -403:权限不足 -404:无视频
  message: string; // 错误信息
  ttl: number; // 1
  data: string; // 视频简介
}

/**
 * 获取视频简介
 * @param params 请求参数
 * @returns Promise<WebInterfaceArchiveDescResponse>
 */
export const getWebInterfaceArchiveDesc = (params: WebInterfaceArchiveDescRequestParams) => {
  return apiRequest.get<WebInterfaceArchiveDescResponse>("/x/web-interface/archive/desc", { params });
};
