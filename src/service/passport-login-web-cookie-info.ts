import { passportRequest } from "./request";

/**
 * 检查是否需要刷新 Cookie - 请求参数
 * 请求方式：GET
 * 认证方式：Cookie（需要携带 SESSDATA，csrf 可选）
 */
export interface WebCookieInfoRequestParams {
  /** CSRF Token（bili_jct，位于 Cookie），可选 */
  csrf?: string;
}

/**
 * 检查是否需要刷新 Cookie - 顶层响应
 */
export interface WebCookieInfoResponse {
  /** 返回值：0 成功；-101 未登录 */
  code: number;
  /** 错误信息（默认为 "0"） */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: {
    /** 是否应该刷新 Cookie：true 需要刷新；false 无需刷新 */
    refresh: boolean;
    /** 当前毫秒时间戳（用于生成 CorrespondPath 获取 refresh_csrf） */
    timestamp: number;
  };
}

/**
 * 检查是否需要刷新 Cookie
 * @param params 可选参数，仅包含 csrf
 * @returns 是否需要刷新及当前时间戳
 */
export function getPassportLoginWebCookieInfo(params?: WebCookieInfoRequestParams): Promise<WebCookieInfoResponse> {
  return passportRequest.get<WebCookieInfoResponse>("/x/passport-login/web/cookie/info", { params });
}
