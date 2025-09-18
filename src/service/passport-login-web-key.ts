import { passportRequest } from "./request";

/**
 * 获取密码登录公钥_web端响应类型
 */
export interface WebKeyResponse {
  code: number; // 返回值 0:成功
  message: string; // 错误信息
  ttl?: number; // 1
  data: {
    hash: string; // 盐值
    key: string; // RSA 公钥（PEM 格式）
  };
}

/**
 * 获取密码登录所需的公钥与哈希
 */
export const getPassportLoginWebKey = () => {
  return passportRequest.get<WebKeyResponse>("/x/passport-login/web/key");
};
