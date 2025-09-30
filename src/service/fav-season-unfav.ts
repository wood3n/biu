import { apiRequest } from "./request";

/**
 * 取消收藏视频合集
 */
export interface FavSeasonUnfavRequestParams {
  /** 目标收藏夹 mdid 列表，逗号分隔 */
  season_id: number;
  /** web */
  platform: string;
}

/**
 * 删除收藏夹 - 响应类型
 */
export interface FavSeasonUnfavResponse {
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
export function postFavSeasonUnfav(data: FavSeasonUnfavRequestParams) {
  return apiRequest.post<FavSeasonUnfavResponse>("/x/v3/fav/season/unfav", data, { useCSRF: true, useFormData: true });
}
