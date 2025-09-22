import { apiRequest } from "./request";

/**
 * 视频添加稍后再看 - 请求参数
 * POST /x/v2/history/toview/add
 */
export interface HistoryToViewAddParams {
  /** 稿件 avid，与 bvid 任选一个 */
  aid?: number;
  /** 稿件 bvid，与 aid 任选一个 */
  bvid?: string;
  /** CSRF Token（bili_jct，位于 Cookie） */
  csrf: string;
}

/**
 * 视频添加稍后再看 - 顶层响应
 */
export interface HistoryToViewAddResponse {
  /** 返回值：0 成功；-101 未登录；-111 csrf 校验失败；-400 请求错误；90001 列表已满；90003 稿件已删除 */
  code: number;
  /** 错误信息（默认为 "0"） */
  message: string;
  /** 固定为 1 */
  ttl: number;
}

/**
 * 视频添加稍后再看
 */
export async function postHistoryToViewAdd(data: HistoryToViewAddParams): Promise<HistoryToViewAddResponse> {
  return apiRequest.post<HistoryToViewAddResponse>("/x/v2/history/toview/add", data);
}
