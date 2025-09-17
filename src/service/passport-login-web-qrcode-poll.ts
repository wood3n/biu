import { passportRequest } from "./request";

/**
 * 二维码登录 - 扫码登录(web端)请求参数类型
 */
export interface QrcodePollRequestParams {
  qrcode_key: string; // 扫码登录秘钥
}

/**
 * 二维码登录 - 扫码登录(web端)响应类型
 */
export interface QrcodePollResponse {
  code: number; // 返回值 0:成功
  message: string; // 错误信息
  data: {
    url: string; // 游戏分站跨域登录 url，未登录为空
    refresh_token: string; // 刷新refresh_token，未登录为空
    timestamp: number; // 登录时间，未登录为0，时间戳单位为毫秒
    code: number; // 0:扫码登录成功 86038:二维码已失效 86090:二维码已扫码未确认 86101:未扫码
    message: string; // 扫码状态信息
  };
}

/**
 * 二维码登录 - 扫码登录状态查询(web端)
 * @param params 包含qrcode_key的请求参数
 * @returns 扫码状态信息
 */
export const getPassportLoginWebQrcodePoll = (params: QrcodePollRequestParams) => {
  return passportRequest.get<QrcodePollResponse>("/x/passport-login/web/qrcode/poll", { params });
};
