import request from "./request";

export interface LoginQrCheckRequestParams {
  key: string | undefined;
}

export interface QrLoginRes {
  code: number;
  cookie: string;
  message: string;
}

/*
 * 二维码检测扫码状态接口
 */
export const getLoginQrCheck = (params: LoginQrCheckRequestParams) => request.get<QrLoginRes>("/login/qr/check", { params });
