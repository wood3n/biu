import request from './request';

export interface CaptchaVerifyRequestParams {
  phone: string | undefined;
  captcha: number | undefined;
  ctcode: string | undefined;
}

/*
 * 验证验证码
 */
export const getCaptchaVerify = (params: CaptchaVerifyRequestParams) => request.get('/captcha/verify', { params });
