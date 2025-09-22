import { apiRequest } from "./request";

/**
 * 清空稍后再看视频列表 - 请求参数
 * POST /x/v2/history/toview/clear
 */
export interface HistoryToViewClearParams {
  /** CSRF Token（bili_jct） */
  csrf: string;
}

/** 顶层响应 */
export interface HistoryToViewClearResponse {
  code: number; // 0 成功 -101 未登录 -111 csrf 校验失败
  message: string; // 错误信息
  ttl: number; // 1
}

/**
 * 清空稍后再看视频列表
 */
export async function postHistoryToViewClear(data: HistoryToViewClearParams): Promise<HistoryToViewClearResponse> {
  return apiRequest.post<HistoryToViewClearResponse>("/x/v2/history/toview/clear", data);
}
