import { passportRequest } from "./request";

/**
 * 使用短信验证码登录_web端请求参数
 */
export interface WebLoginSmsRequestParams {
  cid: number; // 国际冠字码
  tel: number; // 手机号码
  code: number; // 短信验证码
  source: string; // 登录来源，main_web:独立登录页 main_mini:小窗登录
  captcha_key: string; // 短信登录 token
  go_url?: string; // 跳转url，默认为 https://www.bilibili.com
  keep?: boolean; // 是否记住登录，true:记住登录 false:不记住登录
}

/**
 * 使用短信验证码登录_web端响应类型
 */
export interface WebLoginSmsResponse {
  code: number; // 返回值，0表示成功
  message: string; // 错误信息
  data: {
    hint: string; // 登录提示信息
    is_new: boolean; // 是否为新注册用户
    status: number; // 状态码
    url: string; // 跳转 url
    refresh_token: string; // 刷新 token
    timestamp: number; // 当前登录的时间戳
  };
}

/**
 * 使用短信验证码登录_web端
 * @param params 请求参数
 * @returns 登录结果
 */
export function getPassportLoginWebLoginSms(params: WebLoginSmsRequestParams): Promise<WebLoginSmsResponse> {
  return passportRequest.post("/x/passport-login/web/login/sms", params, {
    useFormData: true,
  });
}
