import type { BBPAuthResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 登录 - 请求参数 */
export interface BBPAuthLoginParams {
  username: string;
  password: string;
}

/**
 * 登录 BBPlayer 账号
 * @param params 登录参数
 * @returns Promise<BBPAuthResponse>
 */
export const bbpAuthLogin = (params: BBPAuthLoginParams) => {
  return bbpRequest.post<BBPAuthResponse>("/auth/login", params);
};
