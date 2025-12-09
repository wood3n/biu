import { passportRequest } from "./request";

/**
 * 获取验证码(web端)响应类型
 */
export interface PassportLoginCaptchaResponse {
  code: number; // 0:成功
  message: string;
  data: {
    type: string; // geetest
    token: string;
    geetest: {
      gt: string;
      challenge: string;
    };
  };
}

/**
 * 获取验证码(web端)
 * @param source 来源
 * @returns 验证码信息
 */
export const getPassportLoginCaptcha = (source: string = "main_web") => {
  return passportRequest.get<PassportLoginCaptchaResponse>("/x/passport-login/captcha", {
    params: { source },
  });
};
