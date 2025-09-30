import { apiRequest } from "./request";

/**
 * 收藏视频合集
 */
export interface FavSeasonFavRequestParams {
  /** 目标收藏夹 mdid 列表，逗号分隔 */
  season_id: number;
  /** web */
  platform: string;
}

/**
 * 收藏视频合集 - 响应类型
 */
export interface FavSeasonFavResponse {
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
 * 收藏视频合集
 */
export function postFavSeasonFav(data: FavSeasonFavRequestParams) {
  return apiRequest.post<FavSeasonFavResponse>("/x/v3/fav/season/fav", data, { useCSRF: true, useFormData: true });
}
