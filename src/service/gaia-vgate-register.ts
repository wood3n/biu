import { apiRequest } from "./request";

/**
 * 从 v_voucher 申请 captcha - 请求参数
 * POST /x/gaia-vgate/v1/register
 * 正文：application/x-www-form-urlencoded
 */
export interface GaiaVgateRegisterRequestParams {
  /** v_voucher 字符串（必要） */
  v_voucher: string;
}

/** 极验信息 */
export interface GaiaGeetestInfo {
  /** 极验 id，一般为固定值 */
  gt: string;
  /** 极验 KEY，由后端产生 */
  challenge: string;
}

/** register 接口 data */
export interface GaiaVgateRegisterData {
  /** 验证码类型，目前只有 "geetest" */
  type: string;
  /** 验证码 token（用于后续 validate） */
  token: string;
  /** 极验信息；为 null 则说明该风控无法通过 captcha 解除 */
  geetest: GaiaGeetestInfo | null;
  /** 以下字段文档为 null，占位保持一致 */
  biliword: null;
  phone: null;
  sms: null;
}

/** 顶层响应 */
export interface GaiaVgateRegisterResponse {
  /** 返回值：0 成功；100000 验证码获取失败 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: GaiaVgateRegisterData;
}

/**
 * 从 v_voucher 申请 captcha
 */
export function postGaiaVgateRegister(data: GaiaVgateRegisterRequestParams): Promise<GaiaVgateRegisterResponse> {
  return apiRequest.post<GaiaVgateRegisterResponse>("/x/gaia-vgate/v1/register", data, {
    useFormData: true,
  });
}
