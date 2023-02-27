import request from './request';

interface RequestDataType {
  phone: string;
  captcha: number;
}

/*
 * 验证验证码
 */
export const postCaptchaVerify = (data: RequestDataType) => request.post('/captcha/verify', data);
