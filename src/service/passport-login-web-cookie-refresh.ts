import { passportRequest } from "./request";

/**
 * 刷新 Cookie - 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded 或 JSON 直接提交均支持，后端会解析）
 * 认证方式：Cookie（需要携带 SESSDATA）
 */
export interface WebCookieRefreshRequestParams {
  /** CSRF Token（bili_jct，位于 Cookie） */
  csrf: string;
  /** 实时刷新口令（通过对应的 correspond/1/{CorrespondPath} 页面获取） */
  refresh_csrf: string;
  /** 访问来源，一般为 "main_web" */
  source: string;
  /** 持久化刷新口令（登录成功后返回并存储于 localStorage 的 ac_time_value 字段） */
  refresh_token: string;
}

/**
 * 刷新 Cookie - 顶层响应
 */
export interface WebCookieRefreshResponse {
  /** 返回值：0 成功；-101 未登录；-111 csrf 校验失败；86095 refresh_csrf 错误或 refresh_token 与 cookie 不匹配 */
  code: number;
  /** 错误信息（默认为 "0"） */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: {
    /** 状态，一般为 0 */
    status: number;
    /** 信息，一般为空字符串 */
    message: string;
    /** 新的持久化刷新口令（需覆盖保存到 localStorage 的 ac_time_value 字段） */
    refresh_token: string;
  };
}

/**
 * 刷新 Cookie
 * - 若需要以 x-www-form-urlencoded 方式提交，可以传入 URLSearchParams；若以 JSON 方式提交，直接传对象。
 * - axios 在 withCredentials=true 的情况下会自动携带 Cookie（SESSDATA）。
 */
export function postPassportLoginWebCookieRefresh(
  data: WebCookieRefreshRequestParams | URLSearchParams,
): Promise<WebCookieRefreshResponse> {
  return passportRequest.post<WebCookieRefreshResponse>("/x/passport-login/web/cookie/refresh", data);
}
