import request from './request';

export interface CaptchaSentRequestParams {
  phone: string | undefined;
  ctcode: string | undefined;
}

export interface Response {
  code: number;
  data: boolean;
}

/*
 * 发送验证码
 */
export const getCaptchaSent = (params: CaptchaSentRequestParams) => request.get<Response>('/captcha/sent', { params });
