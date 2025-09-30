import { apiRequest } from "./request";

/**
 * 查询用户与自己关系（互相关系）/x/space/wbi/acc/relation - 请求参数
 * 请求方式：GET
 * 认证方式：Cookie（SESSDATA）或 APP；仅本接口需要 WBI 签名
 */
export interface SpaceWbiAccRelationRequestParams {
  /** 目标用户 mid（必要） */
  mid: number;
}

/**
 * 关系属性对象（最小字段集）
 * 说明：与文档中的“关系属性对象”一致，仅包含与关系相关的核心字段
 */
export interface RelationAttribute {
  /** 目标用户 mid */
  mid: number;
  /** 关系属性：0 未关注；1 悄悄关注（已弃用）；2 已关注；6 已互粉；128 已拉黑 */
  attribute: number;
  /** 关注对方时间（秒级时间戳；未关注为 0） */
  mtime: number;
  /** 分组 id 列表（默认分组为 null） */
  tag: number[] | null;
  /** 特别关注标志：0 否；1 是 */
  special: number;
}

/**
 * 查询用户与自己关系（互相关系） - data
 */
export interface SpaceWbiAccRelationData {
  /** 目标用户对于当前用户的关系 */
  relation: RelationAttribute;
  /** 当前用户对于目标用户的关系 */
  be_relation: RelationAttribute;
}

/**
 * 查询用户与自己关系（互相关系） - 顶层响应
 */
export interface SpaceWbiAccRelationResponse {
  /** 返回值：0 成功；-101 账号未登录；-400 请求错误 */
  code: number;
  /** 错误信息（成功时一般为 "0"） */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: SpaceWbiAccRelationData;
}

/**
 * 查询用户与自己关系（互相关系）
 * - 认证：Cookie（SESSDATA）或 APP
 * - 签名：WBI（内部由请求器在 useWbi: true 时自动加签）
 */
export function getSpaceWbiAccRelation(params: SpaceWbiAccRelationRequestParams): Promise<SpaceWbiAccRelationResponse> {
  return apiRequest.get<SpaceWbiAccRelationResponse>("/x/space/wbi/acc/relation", {
    params,
    useWbi: true,
  });
}
