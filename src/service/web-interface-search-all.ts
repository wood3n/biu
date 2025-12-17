import { apiRequest } from "./request";

/**
 * 综合搜索(web端) - 请求参数
 */
export interface WebSearchAllParams {
  keyword: string; // 需要搜索的关键词
}

/**
 * 综合搜索(web端) - 顶层响应
 */
export interface WebSearchAllResponse {
  code: number; // 0: 成功 -400: 请求错误 -412: 请求被拦截
  message: string; // 错误信息
  ttl: number; // 1
  data: WebSearchAllData;
}

/**
 * 综合搜索(web端) - data 结构
 */
export interface WebSearchAllData {
  seid: string; // 搜索id
  page: number; // 页数 固定为1
  page_size: number; // 每页条数 固定为20
  numResults: number; // 总条数 最大1000
  numPages: number; // 分页数 最大50
  suggest_keyword: string;
  rqt_type: string;
  cost_time?: Record<string, string>;
  exp_list?: Record<string, unknown>;
  egg_hit?: number;
  pageinfo?: Record<string, { numResults?: number; total?: number; pages?: number }>;
  top_tlist?: Partial<Record<WebSearchModuleType, number>>; // 各分类的结果数
  show_module_list?: WebSearchModuleType[]; // 返回结果类型列表
  result: WebSearchAllModule[]; // 结果列表
}

/** 返回的模块类型 */
export type WebSearchModuleType =
  | "activity"
  | "web_game"
  | "card"
  | "media_bangumi"
  | "media_ft"
  | "bili_user"
  | "user"
  | "star"
  | "video";

/** 结果模块 */
export interface WebSearchAllModule {
  result_type: WebSearchModuleType; // 与模块名称一致
  data: any[]; // 各模块的具体数据，结构随类型而异
}

// ——— 常见的视频结果最小字段，便于排序与分页（可按需扩展） ———
export interface SearchVideoItem {
  id?: number; // aid
  aid?: number;
  bvid?: string;
  title?: string;
  author?: string;
  mid?: number;
  pubdate?: number; // 发布时间戳
  play?: number; // 播放数
  video_review?: number; // 弹幕数
  favorites?: number; // 收藏数
  review?: number; // 评论数
  duration?: string | number; // 时长
}

/**
 * 综合搜索(web端)
 * GET /x/web-interface/wbi/search/all/v2
 */
export async function getWebInterfaceWbiSearchAllV2(params: WebSearchAllParams): Promise<WebSearchAllResponse> {
  return apiRequest.get<WebSearchAllResponse>("/x/web-interface/wbi/search/all/v2", { params });
}

/**
 * 对综合搜索结果做客户端分页（按模块）
 * 注意：综合搜索接口本身固定 page=1、page_size=20，此为前端对模块数据的分页裁剪
 */
export function paginateSearchAllResults<T = any>(
  data: WebSearchAllData,
  module: WebSearchModuleType,
  page: number,
  pageSize: number,
): T[] {
  const mod = data.result.find(m => m.result_type === module);
  if (!mod || !Array.isArray(mod.data)) return [] as T[];
  const start = (Math.max(1, page) - 1) * Math.max(1, pageSize);
  return mod.data.slice(start, start + Math.max(1, pageSize)) as T[];
}

export type VideoSortKey = "pubdate" | "play" | "video_review" | "favorites" | "review";

/**
 * 对综合搜索某模块结果做客户端排序（当前仅内置视频的常见数值字段）
 */
export function sortSearchAllResults(
  data: WebSearchAllData,
  module: WebSearchModuleType,
  sortKey: VideoSortKey,
  order: "asc" | "desc" = "desc",
): WebSearchAllData {
  const cloned: WebSearchAllData = { ...data, result: data.result.map(r => ({ ...r, data: [...(r.data || [])] })) };
  const target = cloned.result.find(m => m.result_type === module);
  if (!target) return cloned;
  target.data.sort((a: any, b: any) => {
    const av = Number(a?.[sortKey] ?? 0);
    const bv = Number(b?.[sortKey] ?? 0);
    return order === "asc" ? av - bv : bv - av;
  });
  return cloned;
}
