import { passportRequest } from "./request";

/**
 * 手机号+密码登录_web端请求参数
 */
export interface WebLoginPasswordRequestParams {
  cid: number; // 国际冠字码
  tel: number; // 手机号码
  password: string; // RSA加密后密码（hash + 密码）
  source: string; // 登录来源，main_web:独立登录页 main_mini:小窗登录
  keep?: boolean; // 是否记住登录
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
  };
}

/**
 * 手机号+密码登录_web端
 */
export function postPassportLoginWebLoginPassword(
  params: WebLoginPasswordRequestParams,
): Promise<WebLoginPasswordResponse> {
  return passportRequest.post("/x/passport-login/web/login", params);
}
