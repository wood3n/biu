import { apiRequest } from "./request";

export interface GaiaVGateRegisterRequestParams {
  v_voucher: string;
  csrf?: string;
}

export interface GaiaVGateRegisterResponse {
  code: number;
  message: string;
  ttl: number;
  data: {
    type: string; // "geetest"
    token: string;
    geetest: {
      challenge: string;
      gt: string;
    };
    biliword: null;
    phone: null;
    sms: null;
  };
}

export interface GaiaVGateValidateRequestParams {
  challenge: string;
  token: string;
  validate: string;
  seccode: string;
  csrf?: string;
}

export interface GaiaVGateValidateResponse {
  code: number;
  message: string;
  ttl: number;
  data: {
    is_valid: number; // 1: 验证成功
    grisk_id: string; // gaia_vtoken
  };
}

/**
 * 调用 register 接口获取极验参数的 token challenge
 */
export const postGaiaVGateRegister = (params: GaiaVGateRegisterRequestParams) => {
  return apiRequest.post<GaiaVGateRegisterResponse>("/x/gaia-vgate/v1/register", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

/**
 * 调用 validate 接口获取 grisk_id (gaia_vtoken)
 */
export const postGaiaVGateValidate = (params: GaiaVGateValidateRequestParams) => {
  return apiRequest.post<GaiaVGateValidateResponse>("/x/gaia-vgate/v1/validate", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};
