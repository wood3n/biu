import { passportRequest } from "./request";

/**
 * 二维码登录 - 申请二维码(web端)接口响应类型
 */
export interface QrcodeGenerateResponse {
  code: number; // 返回值 0:成功
  message: string; // 错误信息
  ttl: number; // 1
  data: {
    url: string; // 二维码内容 (登录页面 url)
    qrcode_key: string; // 扫码登录秘钥，恒为32字符
  };
}

/**
 * 二维码登录 - 申请二维码(web端)
 * @returns 二维码信息，包含url和qrcode_key
 */
export const getPassportLoginWebQrcodeGenerate = () => {
  return passportRequest.get<QrcodeGenerateResponse>("/x/passport-login/web/qrcode/generate");
};
