import { passportRequest } from "./request";

/**
 * 退出账号登录（Web）- 请求参数
 * 请求方式：POST（建议使用 application/x-www-form-urlencoded）
 * 认证方式：Cookie（需要携带 DedeUserID、bili_jct、SESSDATA）
 */
export interface PassportLoginExitRequestParams {
  /** CSRF Token（位于 cookie 中的 bili_jct，字段名需为 biliCSRF） */
  biliCSRF: string;
  /** 成功后跳转到的页面，可选，默认 javascript:history.go(-1) */
  gourl?: string;
}

/**
 * 退出账号登录（Web）- 顶层响应
 * 注意：当 Cookie 已失效时，服务端可能直接返回登录页 HTML，而非 JSON。
 */
export interface PassportLoginExitResponse {
  /** 返回值：0 成功；2202 csrf 请求非法 */
  code: number;
  /** 成功时通常存在且为 true */
  status?: boolean;
  /** 时间戳（秒） */
  ts?: number;
  /** 错误信息（成功时可能不存在） */
  message?: string;
  /** 成功时返回的数据本体，包含重定向 URL */
  data?: {
    redirectUrl: string;
  };
}

/**
 * 退出账号登录（Web）
 * - 建议以 x-www-form-urlencoded 方式提交：可传入 URLSearchParams
 * - 也可直接传对象（将以 JSON 方式提交，可能不被服务端接受，按需选择）
 * - axios 在 withCredentials=true 的情况下会自动携带 Cookie
 */
export function postPassportLoginExit(data: PassportLoginExitRequestParams): Promise<PassportLoginExitResponse> {
  return passportRequest.post<PassportLoginExitResponse>("/login/exit/v2", data, {
    useFormData: true,
  });
}
