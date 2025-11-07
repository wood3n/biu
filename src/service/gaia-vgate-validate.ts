import { apiRequest } from "./request";

/**
 * 从验证结果获取 grisk_id（gaia_vtoken）- 请求参数
 * POST /x/gaia-vgate/v1/validate
 * 正文：application/x-www-form-urlencoded
 */
export interface GaiaVgateValidateRequestParams {
  /** CSRF Token（位于 Cookie 的 bili_jct），非必要；若已登录则必要 */
  csrf?: string;
  /** 验证码 challenge（必要） */
  challenge: string;
  /** 验证码 token（必要） */
  token: string;
  /** 验证结果 validate（必要） */
  validate: string;
  /** 验证结果 seccode（必要） */
  seccode: string;
}

/** validate 接口 data */
export interface GaiaVgateValidateData {
  /** 验证结果：1 验证成功 */
  is_valid: number;
  /** gaia_vtoken（用于恢复正常访问） */
  grisk_id: string;
}

/** 顶层响应 */
export interface GaiaVgateValidateResponse {
  /** 返回值：0 成功；-111 csrf 校验失败；100003 验证码过期 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: GaiaVgateValidateData;
}

/**
 * 从验证结果获取 grisk_id（gaia_vtoken）
 */
export function postGaiaVgateValidate(data: GaiaVgateValidateRequestParams): Promise<GaiaVgateValidateResponse> {
  return apiRequest.post<GaiaVgateValidateResponse>("/x/gaia-vgate/v1/validate", data, {
    useFormData: true,
  });
}
