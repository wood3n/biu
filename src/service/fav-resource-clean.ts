import { apiRequest } from "./request";

/**
 * 清空所有失效内容 - 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded）
 * 认证方式：Cookie（需要 csrf）或 APP
 */
export interface FavResourceCleanRequestParams {
  /** 目标收藏夹 id */
  media_id: number | string;
}

/**
 * 清空所有失效内容 - 响应类型
 */
export interface FavResourceCleanResponse {
  /** 返回值 0：成功 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，成功为 0 */
  data: number;
}

/**
 * 清空所有失效内容
 */
export function postFavResourceClean(data: FavResourceCleanRequestParams): Promise<FavResourceCleanResponse> {
  return apiRequest.post<FavResourceCleanResponse>("/x/v3/fav/resource/clean", data, {
    useFormData: true,
    useCSRF: true,
  });
}
