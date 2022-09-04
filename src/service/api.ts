import request from './request';

/**
 * 发送验证码
 */
export const sendCaptcha = (phone: string) => request.get<API.SendCaptchaReqParam, API.BaseRes>('/captcha/sent', {
  params: {
    phone
  }
});

/**
 * 登录
 */
export const login = (data: API.PhoneLoginData) => request.post<API.PhoneLoginData>('/login/cellphone', {
  data
});

/**
 * 退出登录
 */
export const logout = () => request.get('/logout');