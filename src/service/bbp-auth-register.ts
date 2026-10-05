import type { BBPAuthResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 注册账号 - 请求参数 */
export interface BBPAuthRegisterParams {
  username: string;
  password: string;
  name?: string;
  face?: string;
}

/**
 * 注册 BBPlayer 账号
 * @param params 注册参数
 * @returns Promise<BBPAuthResponse>
 */
export const bbpAuthRegister = (params: BBPAuthRegisterParams) => {
  return bbpRequest.post<BBPAuthResponse>("/auth/register", params);
};
