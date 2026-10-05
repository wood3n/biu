import type { BBPAccountResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/**
 * 获取当前 BBPlayer 用户信息
 * @returns Promise<BBPAccountResponse>
 */
export const bbpAuthMe = () => {
  return bbpRequest.get<BBPAccountResponse>("/auth/me");
};
