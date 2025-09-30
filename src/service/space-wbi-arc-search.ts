import { apiRequest } from "./request";

/**
 * 查询用户投稿视频明细（WBI签名）请求参数
 */
export interface SpaceWbiArcSearchRequestParams {
  /** 目标用户 mid */
  mid: number;
  /** 每页项数，默认 30，最大 30 */
  ps?: number;
  /** 页码，从 1 开始 */
  pn?: number;
  /** 子分区 tid，可选 */
  tid?: number;
  /** 关键字搜索，可选 */
  keyword?: string;
  /** 排序字段，如 "pubdate" | "click"，可选 */
  order?: string;
}

/**
 * vlist 列表的条目（常见字段）
 */
export interface SpaceArcVListItem {
  /** 稿件 avid */
  aid: number;
  /** 稿件 bvid */
  bvid: string;
  /** 稿件标题 */
  title: string;
  /** 稿件封面图片 url */
  pic: string;
  /** 播放数 */
  play: number;
  /** 评论数 */
  comment: number;
  /** 投稿者昵称 */
  author: string;
  /** 投稿者 mid */
  mid: number;
  /** 稿件创建时间（UNIX 秒） */
  created: number;
  /** 稿件总时长字符串，如 "3:20" */
  length: string;
  /** 可选：简介/描述 */
  description?: string;
}

/**
 * tlist 条目（分区统计）
 */
export interface SpaceArcTListItem {
  /** 分区 tid */
  tid: number;
  /** 该分区下视频数量 */
  count: number;
  /** 可选：分区名称 */
  name?: string;
}

/**
 * 列表数据
 */
export interface SpaceArcSearchList {
  /** 分区统计，键为 tid（字符串） */
  tlist?: Record<string, SpaceArcTListItem>;
  /** 投稿视频列表 */
  vlist: SpaceArcVListItem[];
}

/**
 * 分页信息
 */
export interface SpaceArcSearchPage {
  /** 当前页码（从 1 开始） */
  pn: number;
  /** 每页项数 */
  ps: number;
  /** 总条目数或最大页数提示字段（实际返回结构以服务端为准） */
  count: number;
  /** 其他未枚举字段（保留扩展） */
  [key: string]: any;
}

/**
 * 数据本体
 */
export interface SpaceWbiArcSearchData {
  list: SpaceArcSearchList;
  page: SpaceArcSearchPage;
}

/**
 * 顶层响应
 */
export interface SpaceWbiArcSearchResponse {
  /** 返回值：0 成功；-352 请求被风控；-400 请求错误 */
  code: number;
  /** 错误信息（成功时一般为 "0"） */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: SpaceWbiArcSearchData;
}

/**
 * 查询用户投稿视频明细（WBI签名）
 */
export function getSpaceWbiArcSearch(params: SpaceWbiArcSearchRequestParams): Promise<SpaceWbiArcSearchResponse> {
  return apiRequest.get<SpaceWbiArcSearchResponse>("/x/space/wbi/arc/search", {
    params,
    useWbi: true,
  });
}
