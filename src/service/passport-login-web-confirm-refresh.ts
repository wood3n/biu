import { passportRequest } from "./request";

/**
 * 确认更新（使旧 refresh_token 对应的 Cookie 失效）- 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded 或 JSON 直接提交均支持）
 * 认证方式：Cookie（需要携带新的 SESSDATA）
 */
export interface WebConfirmRefreshRequestParams {
  /** CSRF Token（bili_jct，位于新的 Cookie 中） */
  csrf: string;
  /** 旧的持久化刷新口令（刷新前 localStorage 中的 ac_time_value 值） */
  refresh_token: string;
}

/**
 * 确认更新 - 顶层响应
 */
export interface WebConfirmRefreshResponse {
  /** 返回值：0 成功；-101 未登录；-111 csrf 校验失败；-400 请求错误 */
  code: number;
  /** 错误信息（默认为 "0"） */
  message: string;
  /** 固定为 1 */
  ttl: number;
}

/**
 * 确认更新
 * - 该步骤需要使用“刷新后”的新 Cookie（包含新的 SESSDATA 与 bili_jct）。
 * - axios 在 withCredentials=true 的情况下会自动携带 Cookie。
 */
export function postPassportLoginWebConfirmRefresh(
  data: WebConfirmRefreshRequestParams | URLSearchParams,
): Promise<WebConfirmRefreshResponse> {
  return passportRequest.post<WebConfirmRefreshResponse>("/x/passport-login/web/confirm/refresh", data);
}
