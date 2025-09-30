import { apiRequest } from "./request";

/**
 * 操作用户关系
 * 请求方式：POST
 * 认证方式：Cookie(SESSDATA) 或 APP（access_key）
 * act 操作代码：
 * 1：关注；2：取关；5：拉黑；6：取消拉黑；7：踢出粉丝；（3：悄悄关注、4：取消悄悄关注已下线）
 */
export interface RelationModifyRequestParams {
  /** 目标用户 mid，必要 */
  fid: number;
  /** 操作代码，必要（1：关注；2：取关；5：拉黑；6：取消拉黑；7：踢出粉丝） */
  act: number;
  /** 关注来源代码，非必要（如：个人空间：11，视频：14，评论区：15 等） */
  re_src?: number;
}

/**
 * 操作用户关系 - 响应类型
 */
export interface RelationModifyResponse {
  /** 返回值 0：成功；其他详见文档错误码 */
  code: number;
  /** 错误信息，成功为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
}

/**
 * 操作用户关系
 */
export function postRelationModify(data: RelationModifyRequestParams) {
  return apiRequest.post<RelationModifyResponse>("/x/relation/modify", data, { useCSRF: true, useFormData: true });
}
