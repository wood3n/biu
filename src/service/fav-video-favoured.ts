import { apiRequest } from "./request";

/**
 * 判断视频是否被收藏 (双端)
 * - GET https://api.bilibili.com/x/v2/fav/video/favoured
 * - 认证方式：APP（access_key）或 Cookie（SESSDATA）
 */
export interface FavVideoFavouredParams {
  /** APP 登录 Token（APP 方式必要） */
  access_key?: string;
  /** 稿件 avid 或稿件 bvid（必要） */
  aid: number | string;
}

/** 顶层响应 */
export interface FavVideoFavouredResponse {
  /** 返回值：0 成功；-400 请求错误；-101 账号未登录 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: FavVideoFavouredData;
}

/** data 对象 */
export interface FavVideoFavouredData {
  /** 作用尚不明确，示例为 1 */
  count: number;
  /** 是否收藏：true 已收藏；false 未收藏 */
  favoured: boolean;
}

/**
 * 判断视频是否被收藏
 * - 认证：APP 或 Cookie（SESSDATA）
 * - 参数：`aid` 可同时接受 avid（数字）或 bvid（字符串）
 *
 * 示例：
 * ```ts
 * await getFavVideoFavoured({ aid: 46281123 }); // avid
 * await getFavVideoFavoured({ aid: "BV1Bb411H7Dv" }); // bvid
 * ```
 */
export function getFavVideoFavoured(params: FavVideoFavouredParams): Promise<FavVideoFavouredResponse> {
  return apiRequest.get<FavVideoFavouredResponse>("/x/v2/fav/video/favoured", { params });
}
