import { apiRequest } from "./request";

export interface HistoryDeleteRequestParams {
  /** 目标历史记录，格式为{业务类型}_{目标id}，视频：archive_{稿件avid} */
  kid: number | string;
}

export interface HistoryDeleteResponse {
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
 * 删除历史
 */
export function postHistoryDelete(data: HistoryDeleteRequestParams) {
  return apiRequest.post<HistoryDeleteResponse>("/x/v2/history/delete", data, {
    useCSRF: true,
    useFormData: true,
  });
}
