import type { BBPAccountResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/** 更新个人资料 - 请求参数 */
export interface BBPAuthProfileParams {
  name?: string;
  face?: string;
}

/**
 * 更新 BBPlayer 个人资料
 * @param params 更新参数
 * @returns Promise<BBPAccountResponse>
 */
export const bbpAuthProfile = (params: BBPAuthProfileParams) => {
  return bbpRequest.patch<BBPAccountResponse>("/auth/profile", params);
};
