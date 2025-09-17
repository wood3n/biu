import { passportRequest } from "./request";

/**
 * 发送短信验证码_web端请求参数
 */
export interface WebSmsSendRequestParams {
  cid: number; // 国际冠字码
  tel: number; // 手机号码
  source: string; // 登录来源，main_web:独立登录页 main_mini:小窗登录
  token: string; // 登录 API token
  challenge: string; // 极验 challenge
  validate: string; // 极验 result
  seccode: string; // 极验 result +|jordan
}

/**
 * 发送短信验证码_web端响应类型
 */
export interface WebSmsSendResponse {
  code: number; // 返回值，0表示成功
  message: string; // 错误信息
  data: {
    captcha_key: string; // 短信登录 token
  };
}

/**
 * 发送短信验证码_web端
 * @param params 请求参数
 * @returns 短信验证码发送结果
 */
export function getPassportLoginWebSmsSend(params: WebSmsSendRequestParams): Promise<WebSmsSendResponse> {
  return passportRequest.post("/x/passport-login/web/sms/send", params);
}
