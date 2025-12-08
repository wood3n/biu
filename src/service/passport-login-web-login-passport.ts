import { passportRequest } from "./request";

/**
 * 手机号+密码登录_web端请求参数
 */
export interface WebLoginPasswordRequestParams {
  username: string; // 用户登录账号 手机号或邮箱地址
  password: string; // RSA加密后密码（hash + 密码）
  keep: number; // 0
  token: string; // 登录 token
  challenge: string; // 极验 challenge
  validate: string; // 极验 result
  seccode: string; // 极验 result +|jordan
  source?: string; // 登录来源，main_web:独立登录页 main_mini:小窗登录
  go_url?: string; // 跳转 url
}

/**
 * 手机号+密码登录_web端响应
 */
export interface WebLoginPasswordResponse {
  code: number; // 0:成功
  message: string;
  ttl?: number;
  data?: {
    status?: number;
    url?: string;
    refresh_token?: string;
    timestamp?: number;
    message?: string;
  };
}

/**
 * 手机号+密码登录_web端
 */
export function postPassportLoginWebLoginPassword(
  params: WebLoginPasswordRequestParams,
): Promise<WebLoginPasswordResponse> {
  return passportRequest.post("/x/passport-login/web/login", params, {
    useFormData: true, // API usually requires form data
  });
}
