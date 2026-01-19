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
  page_size?: number; // 每页数量
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
  result: T[];
  show_column?: number;
}

// ——— 分类返回项：根据类型分别定义最常用字段（可按需扩展） ———
export interface SearchVideoItem {
  aid: number;
  bvid: string;
  title: string;
  author: string;
  pic: string;
  mid: number;
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
  videos?: number;
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

/**
 * GET /x/web-interface/wbi/search/type
 */
export async function getWebInterfaceWbiSearchType<T = any>(
  params: WebSearchTypeParams,
): Promise<WebSearchTypeResponse<T>> {
  return apiRequest.get<WebSearchTypeResponse<T>>("/x/web-interface/wbi/search/type", {
    params,
    useWbi: true,
  });
}

/**
 * 客户端排序辅助（以视频为例）
 */
export type TypeVideoSortKey = "pubdate" | "play" | "video_review" | "favorites" | "review";
