import { apiRequest } from "./request";

/**
 * 删除收藏夹 - 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded）
 * 认证方式：Cookie（需要 csrf）或 APP
 */
export interface FavFolderDelRequestParams {
  /** 目标收藏夹 mdid 列表，逗号分隔 */
  media_ids: string;
}

/**
 * 删除收藏夹 - 响应类型
 */
export interface FavFolderDelResponse {
  /** 返回值 0：成功 */
  code: number;
  /** 错误信息，成功为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，成功为 0 */
  data: number;
}

/**
 * 删除收藏夹
 */
export function postFavFolderDel(data: FavFolderDelRequestParams): Promise<FavFolderDelResponse> {
  return apiRequest.post<FavFolderDelResponse>("/x/v3/fav/folder/del", data, { useCSRF: true, useFormData: true });
}
