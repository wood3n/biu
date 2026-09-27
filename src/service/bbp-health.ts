import type { BBPHealthResponse } from "./bbp-types";

import { bbpRequest } from "./request";

/**
 * BBPlayer 后端健康检查
 * @returns Promise<BBPHealthResponse>
 */
export const bbpHealth = () => {
  return bbpRequest.get<BBPHealthResponse>("/health", { skipAuth: true });
};
