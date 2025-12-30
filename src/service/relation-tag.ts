import type { RelationListItem } from "./relation-followings";

import { apiRequest } from "./request";

/**
 * 查询关注分组列表 - 响应
 */
export interface RelationTagsResponse {
  code: number;
  message: string;
  ttl: number;
  data: RelationTag[];
}

/**
 * 关注分组对象
 */
export interface RelationTag {
  /** 分组 id：-10 特别关注；0 默认分组 */
  tagid: number;
  /** 分组名称 */
  name: string;
  /** 分组成员数 */
  count: number;
  /** 提示信息 */
  tip: string;
}

/**
 * 查询关注分组列表
 * - 请求方式：GET
 * - 认证方式：Cookie（SESSDATA）或 APP
 */
export function getRelationTags(): Promise<RelationTagsResponse> {
  return apiRequest.get<RelationTagsResponse>("/x/relation/tags");
}

/**
 * 查询关注分组明细 - 请求参数
 */
export interface RelationTagDetailRequestParams {
  /** 分组 id（必要）：0 默认分组；-10 特别关注；-20 所有 */
  tagid: number;
  /** 排序方式（非必要）："" 按照关注顺序排列；"attention" 按照最常访问排列 */
  order_type?: "" | "attention";
  /** 每页项数，默认为 20 */
  ps?: number;
  /** 页码，默认为 1 */
  pn?: number;
}

/**
 * 查询关注分组明细 - 响应
 */
export interface RelationTagDetailResponse {
  code: number;
  message: string;
  ttl: number;
  data: RelationTagUser[];
}

/**
 * 关注分组中的成员对象
 */
export interface RelationTagUser {
  /** 用户 mid */
  mid: number;
  /** 关系属性（恒为 0） */
  attribute: number;
  /** 关注分组 id（恒为 null） */
  tag: null;
  /** 是否特别关注（恒为 0） */
  special: number;
  /** 用户昵称 */
  uname: string;
  /** 用户头像 url */
  face: string;
  /** 用户签名 */
  sign: string;
  /** 认证信息 */
  official_verify?: {
    type: number;
    desc: string;
  };
  /** 会员信息 */
  vip?: {
    vipType: number;
    vipDueDate: number;
    vipStatus: number;
    label?: {
      path: string;
      text?: string;
      label_theme?: string;
    };
  };
  /** 直播状态 */
  live?: {
    live_status: number;
    jump_url: string;
  };
  /** (?) */
  follow_time?: string;
}

/**
 * 查询关注分组明细
 * - 请求方式：GET
 * - 认证方式：Cookie（SESSDATA）或 APP
 * - 说明：只可查询属于自己的分组
 */
export function getRelationTag(params: RelationTagDetailRequestParams): Promise<RelationTagDetailResponse> {
  return apiRequest.get<RelationTagDetailResponse>("/x/relation/tag", { params });
}

/**
 * 搜索关注明细 - 请求参数
 */
export interface SearchFollowingsRequestParams {
  /** 目标用户 mid（必要） */
  vmid: number;
  /** 搜索关键词（非必要） */
  name?: string;
  /** 每页项数，默认为 50 */
  ps?: number;
  /** 页码，默认为 1 */
  pn?: number;
}

/**
 * 搜索关注明细 - 响应
 */
export interface SearchFollowingsResponse {
  code: number;
  message: string;
  ttl: number;
  data: {
    list: RelationListItem[];
    total: number;
    re_version?: number;
  };
}

/**
 * 搜索关注明细
 * - 请求方式：GET
 * - 认证方式：Cookie（SESSDATA）或 APP
 */
export function searchFollowings(params: SearchFollowingsRequestParams): Promise<SearchFollowingsResponse> {
  return apiRequest.get<SearchFollowingsResponse>("/x/relation/followings/search", { params });
}

/**
 * 创建关注分组 - 请求参数
 */
export interface CreateRelationTagRequestParams {
  /** 分组名（必要）：最长 16 字符 */
  tag: string;
  /** CSRF Token（Cookie 方式必要），axios 拦截器通常会自动处理，这里定义以便手动传入 */
  csrf?: string;
}

/**
 * 创建关注分组 - 响应
 */
export interface CreateRelationTagResponse {
  code: number;
  message: string;
  ttl: number;
  data: {
    tagid: number;
  };
}

/**
 * 创建关注分组
 * - 请求方式：POST
 * - 认证方式：Cookie（SESSDATA）或 APP
 */
export function createRelationTag(data: CreateRelationTagRequestParams): Promise<CreateRelationTagResponse> {
  return apiRequest.post<CreateRelationTagResponse>("/x/relation/tag/create", data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    useCSRF: true,
  });
}

/**
 * 重命名关注分组 - 请求参数
 */
export interface UpdateRelationTagRequestParams {
  /** 分组 id（必要） */
  tagid: number;
  /** 新名称（必要）：最长 16 字符 */
  name: string;
  csrf?: string;
}

/**
 * 重命名关注分组 - 响应
 */
export interface UpdateRelationTagResponse {
  code: number;
  message: string;
  ttl: number;
}

/**
 * 重命名关注分组
 * - 请求方式：POST
 * - 认证方式：Cookie（SESSDATA）或 APP
 */
export function updateRelationTag(data: UpdateRelationTagRequestParams): Promise<UpdateRelationTagResponse> {
  return apiRequest.post<UpdateRelationTagResponse>("/x/relation/tag/update", data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    useCSRF: true,
  });
}

/**
 * 删除关注分组 - 请求参数
 */
export interface DeleteRelationTagRequestParams {
  /** 分组 id（必要） */
  tagid: number;
  csrf?: string;
}

/**
 * 删除关注分组 - 响应
 */
export interface DeleteRelationTagResponse {
  code: number;
  message: string;
  ttl: number;
}

/**
 * 删除关注分组
 * - 请求方式：POST
 * - 认证方式：Cookie（SESSDATA）或 APP
 */
export function deleteRelationTag(data: DeleteRelationTagRequestParams): Promise<DeleteRelationTagResponse> {
  return apiRequest.post<DeleteRelationTagResponse>("/x/relation/tag/del", data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    useCSRF: true,
  });
}

/**
 * 添加用户到关注分组 - 请求参数
 */
export interface RelationTagAddUsersRequestParams {
  /** 目标用户 mid，多个用逗号分隔 */
  fids: string;
  /** 目标分组 id，多个用逗号分隔 */
  tagids: string;
}

/**
 * 添加用户到关注分组 - 响应
 */
export interface RelationTagAddUsersResponse {
  code: number;
  message: string;
  ttl: number;
}

/**
 * 添加用户到关注分组
 * - 请求方式：POST
 * - 认证方式：Cookie（SESSDATA）或 APP
 * - 说明：如需删除分组中的成员，请将 tagids 设为 0，即移动至默认分组
 */
export function relationTagAddUsers(data: RelationTagAddUsersRequestParams) {
  return apiRequest.post<RelationTagAddUsersResponse>("/x/relation/tags/addUsers", data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    useCSRF: true,
  });
}
