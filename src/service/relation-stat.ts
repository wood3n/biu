import { apiRequest } from "./request";

/**
 * 用户关系状态数（/x/relation/stat） - 请求参数
 * 请求方式：GET
 * 认证方式：Cookie（SESSDATA）或 APP
 */
export interface RelationStatRequestParams {
  /** APP 登录 Token（APP 方式必要） */
  access_key?: string;
  /** 目标用户 mid（必要） */
  vmid: number;
}

/**
 * 用户关系状态数（/x/relation/stat） - data
 */
export interface RelationStatData {
  /** 目标用户 mid */
  mid: number;
  /** 关注数 */
  following: number;
  /** 悄悄关注数（未登录或非自己恒为 0） */
  whisper: number;
  /** 黑名单数（未登录或非自己恒为 0） */
  black: number;
  /** 粉丝数 */
  follower: number;
}

/**
 * 用户关系状态数（/x/relation/stat） - 顶层响应
 */
export interface RelationStatResponse {
  /** 返回值 0：成功；-400：请求错误 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: RelationStatData;
}

/**
 * 查询用户关系状态数
 * - 认证：Cookie（SESSDATA）或 APP
 */
export function getRelationStat(params: RelationStatRequestParams): Promise<RelationStatResponse> {
  return apiRequest.get<RelationStatResponse>("/x/relation/stat", { params });
}
