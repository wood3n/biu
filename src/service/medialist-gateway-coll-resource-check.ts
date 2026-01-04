import { apiRequest } from "./request";

/**
 * 检查资源是否已被收藏到收藏夹 - 请求参数
 * 接口：/medialist/gateway/coll/resource/check
 */
export interface CollResourceCheckParams {
  /** 音频 sid */
  rid: number;
  /** 12 表示音频 */
  type: number;
}

/**
 * 检查资源是否已被收藏到收藏夹 - 响应数据
 * data 通常为 0/1 等数值标识
 */
export interface CollResourceCheckResponse {
  code: number;
  /** 1为收藏，0为没有收藏 */
  data: number;
  message: string;
}

/**
 * 检查音乐收藏状态
 */
export const getCollResourceCheck = (params: CollResourceCheckParams) => {
  return apiRequest.get<CollResourceCheckResponse>("/medialist/gateway/coll/resource/check", {
    params,
  });
};
