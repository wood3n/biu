import { apiRequest } from "./request";

/**
 * 批量查询用户与自己关系 - 请求参数
 * GET /x/relation/relations
 */
export interface RelationRelationsRequestParams {
  /** 目标用户 mid 列表，用逗号分隔 */
  fids: string;
}

/**
 * 关系属性对象
 */
export interface RelationAttribute {
  /** 目标用户 mid */
  mid: number;
  /** 关系属性：0:未关注 1:悄悄关注(已弃用) 2:已关注 6:已互粉 128:已拉黑 */
  attribute: number;
  /** 关注对方时间（秒级时间戳），未关注为 0 */
  mtime: number;
  /** 分组 id 列表，默认分组为 null，存在至少一个分组为数组 */
  tag: number[] | null;
  /** 特别关注标志：0:否 1:是 */
  special: number;
}

/**
 * 批量查询用户与自己关系 - 响应
 */
export interface RelationRelationsResponse {
  code: number;
  message: string;
  ttl: number;
  /** 键为 mid，值为关系属性对象 */
  data: Record<string, RelationAttribute>;
}

/**
 * 批量查询用户与自己关系
 */
export function getRelationRelations(params: RelationRelationsRequestParams) {
  return apiRequest.get<RelationRelationsResponse>("/x/relation/relations", { params });
}
