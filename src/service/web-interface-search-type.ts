import { apiRequest } from "./request";

/**
 * 公共：通用分页响应头
 */
export interface WebSearchPagedMeta {
  seid: string | number;
  page: number;
  pagesize: number; // 固定 20
  numResults: number; // 最大 1000
  numPages: number; // 最大 50
}

/**
 * 分类搜索(web端) - 基础参数
 */
export interface WebSearchTypeBaseParams {
  keyword: string; // 关键词（必要）
  page?: number; // 页码，默认 1
}

/**
 * 分类：视频
 */
export interface WebSearchTypeVideoParams extends WebSearchTypeBaseParams {
  search_type: "video"; // 固定 video
  order?: "totalrank" | "click" | "pubdate" | "dm" | "stow" | "scores"; // 综合/最多点击/最新发布/最多弹幕/最多收藏/最多评论
  duration?: 0 | 1 | 2 | 3 | 4; // 全部/ <10 / 10-30 / 30-60 / >60 (分钟)
  tids?: number; // 分区 tid（0 表示全部）
}

/**
 * 分类：用户
 */
export interface WebSearchTypeUserParams extends WebSearchTypeBaseParams {
  search_type: "bili_user"; // 固定 bili_user
  order?: 0 | "fans" | "level"; // 0 默认 / 粉丝数 / 等级
  order_sort?: 0 | 1; // 仅用户：0 降序 1 升序
  user_type?: 0 | 1 | 2 | 3; // 仅用户：0 全部 1 up主 2 普通 3 认证
}

/**
 * 分类：专栏
 */
export interface WebSearchTypeArticleParams extends WebSearchTypeBaseParams {
  search_type: "article";
  order?: "totalrank" | "click" | "pubdate" | "scores" | "attention"; // 专栏多了一个 attention（最多喜欢）
  category_id?: 0 | 1 | 2 | 3 | 16 | 17 | 28 | 29; // 0 全部；动画2 游戏1 影视28 生活3 兴趣29 轻小说16 科技17
}

/**
 * 分类：相簿
 */
export interface WebSearchTypePhotoParams extends WebSearchTypeBaseParams {
  search_type: "photo";
  order?: "totalrank" | "click" | "pubdate" | "scores";
  category_id?: 0 | 1 | 2; // 0 全部；画友1 摄影2
}

/**
 * 分类：直播（间及主播）
 */
export interface WebSearchTypeLiveParams extends WebSearchTypeBaseParams {
  search_type: "live"; // live 表示“直播间及主播”聚合
  order?: "online" | "live_time"; // 人气 / 最新开播
}

export type WebSearchTypeParams =
  | WebSearchTypeVideoParams
  | WebSearchTypeUserParams
  | WebSearchTypeArticleParams
  | WebSearchTypePhotoParams
  | WebSearchTypeLiveParams;

/**
 * 分类搜索(web端) - 顶层响应
 */
export interface WebSearchTypeResponse<T = any> {
  code: number; // 0 成功 -400 请求错误 -412 被拦截 -1200 类型不存在
  message: string;
  ttl: number; // 1
  data: WebSearchTypeData<T>;
}

/**
 * 分类搜索(web端) - data
 * 直播使用对象（包含 live_room / live_user），其它类型使用数组
 */
export interface WebSearchTypeData<T = any> extends WebSearchPagedMeta {
  suggest_keyword?: string;
  rqt_type?: string;
  cost_time?: Record<string, string>;
  exp_list?: Record<string, unknown>;
  egg_hit?: number;
  pageinfo?: {
    live_room?: WebSearchPagedMeta;
    live_user?: WebSearchPagedMeta;
  };
  result: T[] | { live_room: T[]; live_user: T[] };
  show_column?: number;
}

// ——— 分类返回项：根据类型分别定义最常用字段（可按需扩展） ———
export interface SearchVideoItem {
  aid?: number;
  bvid?: string;
  title?: string;
  author?: string;
  mid?: number;
  pubdate?: number;
  play?: number;
  video_review?: number;
  favorites?: number;
  review?: number;
  duration?: string | number;
}

export interface SearchUserItem {
  mid: number;
  uname?: string;
  usign?: string;
  fans?: number;
  level?: number;
  upic?: string;
  official_verify?: { type?: number; desc?: string };
}

export interface SearchArticleItem {
  id: number; // cvid
  title?: string;
  up_name?: string;
  view?: number;
  like?: number;
  reply?: number;
  publish_time?: number;
}

export interface SearchPhotoItem {
  doc_id: number;
  title?: string;
  user?: string;
  cnt_info?: { collect?: number; play?: number; reply?: number };
  upload_time?: number;
}

// ——— 分类筛选条件处理：把“用户排序顺序 / 时长 / 分区 / 分类”等参数统一规范化 ———
export function normalizeTypeParams(params: WebSearchTypeParams): Record<string, string | number> {
  const base: Record<string, string | number> = { keyword: params.keyword, page: params.page ?? 1 };
  switch (params.search_type) {
    case "video":
      return {
        ...base,
        search_type: "video",
        order: params.order ?? "totalrank",
        duration: params.duration ?? 0,
        tids: params.tids ?? 0,
      };
    case "bili_user":
      return {
        ...base,
        search_type: "bili_user",
        order: params.order ?? 0,
        order_sort: (params as WebSearchTypeUserParams).order_sort ?? 0,
        user_type: (params as WebSearchTypeUserParams).user_type ?? 0,
      };
    case "article":
      return {
        ...base,
        search_type: "article",
        order: params.order ?? "totalrank",
        category_id: (params as WebSearchTypeArticleParams).category_id ?? 0,
      };
    case "photo":
      return {
        ...base,
        search_type: "photo",
        order: params.order ?? "totalrank",
        category_id: (params as WebSearchTypePhotoParams).category_id ?? 0,
      };
    case "live":
      return {
        ...base,
        search_type: "live",
        order: params.order ?? "online",
      };
    default:
      return base;
  }
}

/**
 * 分类结果统计：返回项数、分页等
 */
export function summarizeTypeResult<T = any>(data: WebSearchTypeData<T>) {
  const total = data.numResults ?? 0;
  const pages = data.numPages ?? 0;
  const size = data.pagesize ?? 20;
  let count = 0;
  if (Array.isArray(data.result)) count = data.result.length;
  else if (data.result && typeof data.result === "object") {
    const r = data.result as { live_room?: T[]; live_user?: T[] };
    count = (r.live_room?.length ?? 0) + (r.live_user?.length ?? 0);
  }
  return { total, pages, pageSize: size, count };
}

/**
 * GET /x/web-interface/wbi/search/type
 */
export async function getWebInterfaceWbiSearchType<T = any>(
  params: WebSearchTypeParams,
): Promise<WebSearchTypeResponse<T>> {
  try {
    const normalized = normalizeTypeParams(params);
    const res = await apiRequest.get<WebSearchTypeResponse<T>>("/x/web-interface/wbi/search/type", {
      params: normalized,
    });
    if (res.code !== 0) throw new Error(res.message || `Search type failed: ${res.code}`);
    return res;
  } catch (err: any) {
    throw new Error(err?.message || "Network error");
  }
}

/**
 * 客户端排序辅助（以视频为例）
 */
export type TypeVideoSortKey = "pubdate" | "play" | "video_review" | "favorites" | "review";
export function sortTypeVideoResults(items: SearchVideoItem[], key: TypeVideoSortKey, order: "asc" | "desc" = "desc") {
  return [...items].sort((a, b) => {
    const av = Number(a?.[key] ?? 0);
    const bv = Number(b?.[key] ?? 0);
    return order === "asc" ? av - bv : bv - av;
  });
}
