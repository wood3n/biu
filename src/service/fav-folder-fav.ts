import { apiRequest } from "./request";

/**
 * 收藏视频收藏夹
 */
export interface FavFolderFavRequestParams {
  /** 目标收藏夹 mdid 列表，逗号分隔 */
  media_id: number;
  /** web */
  platform: string;
}

/**
 * 收藏视频收藏夹 - 响应类型
 */
export interface FavFolderFavResponse {
  /** 返回值 0：成功 */
  code: number;
  /** 错误信息，成功为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，成功为 SUCCESS */
  data: string;
}

/**
 * 取消收藏视频合集
 */
export function postFavFolderFav(data: FavFolderFavRequestParams) {
  return apiRequest.post<FavFolderFavResponse>("/x/v3/fav/folder/fav", data, { useCSRF: true, useFormData: true });
}
