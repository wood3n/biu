import { apiRequest } from "./request";

/**
 * 删除稍后再看视频 - 请求参数
 * POST /x/v2/history/toview/del
 */
export interface HistoryToViewDelParams {
  /** 是否删除所有已观看的视频，默认 false */
  viewed?: boolean;
  /** 删除的目标记录的 avid，可选 */
  aid?: number;
}

/** 顶层响应 */
export interface HistoryToViewDelResponse {
  code: number; // 0 成功 -101 未登录 -111 csrf 校验失败 -400 请求错误
  message: string; // 错误信息
  ttl: number; // 1
}

/**
 * 删除稍后再看中已观看的视频
 */
export async function postHistoryToViewDel(data: HistoryToViewDelParams): Promise<HistoryToViewDelResponse> {
  return apiRequest.post<HistoryToViewDelResponse>("/x/v2/history/toview/del", data, {
    useFormData: true,
    useCSRF: true,
  });
}
