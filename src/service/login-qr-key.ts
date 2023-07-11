import request from './request';

export interface QrLoginkey {
  data: {
    code: number;
    unikey: string;
  }
}

/*
 * 二维码 key 生成接口
 */
export const getLoginQrKey = () => request.get<QrLoginkey>('/login/qr/key');
