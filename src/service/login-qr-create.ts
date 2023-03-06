import request from './request';

export interface LoginQrCreateRequestParams {
  key: string | undefined;
}

export interface QrLoginImg {
  data: {
    /**
     * base64
     */
    qrimg: string;
    qrUrl: string;
  }
}

/*
 * 二维码生成接口
 */
export const getLoginQrCreate = (params: LoginQrCreateRequestParams) => request.get<QrLoginImg>('/login/qr/create', { params });
