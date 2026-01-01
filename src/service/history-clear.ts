import { apiRequest } from "./request";
/**
 * 清空所有失效内容 - 响应类型
 */
export interface HistoryClearResponse {
  /** 返回值 0：成功 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，成功为 0 */
  data: number;
}

/**
 * 清空历史记录
 */
export function postHistoryClear() {
  return apiRequest.post<HistoryClearResponse>(
    "/x/v2/history/clear",
    {},
    {
      useCSRF: true,
      useFormData: true,
    },
  );
}
