import request from './request';

interface RequestParamsType {
  phone: string;
}

/*
 * 发送验证码
 */
export const getCaptchaSent = (params: RequestParamsType) => request.get('/captcha/sent', { params });
