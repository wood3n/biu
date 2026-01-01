import { apiRequest } from "./request";

/** 业务类型（最后一项业务类型；筛选项也会使用到） */
export type HistoryBusinessType = "archive" | "pgc" | "live" | "article-list" | "article";

/** 分类筛选类型（请求参数 type） */
export type HistoryFilterType = "all" | "archive" | "live" | "article";

/**
 * 获取历史记录列表(Web端) - 请求参数
 * GET /x/web-interface/history/cursor
 */
export interface WebInterfaceHistorySearchParams {
  /** 搜索关键词 */
  keyword?: string;
  /** archive：投稿 */
  business?: HistoryBusinessType;
  /** 开始时间时间戳，默认为 0（当前时间） */
  add_time_start?: number;
  /** 结束时间时间戳，默认为 0（当前时间） */
  add_time_end?: number;
  /** 视频最大时长（秒），默认为 0（不筛选） */
  arc_max_duration?: number;
  /** 视频最小时长（秒），默认为 0（不筛选） */
  arc_min_duration?: number;
  /** 设备类型，默认为 0（不筛选） */
  device_type?: number;
  /** 页码 */
  pn?: number;
}

/** 历史记录页面信息 */
export interface HistoryCursorInfo {
  /** 最后一项目标 id（与请求参数 max 对应） */
  max: number;
  /** 最后一项时间节点时间戳（与请求参数 view_at 对应） */
  view_at: number;
  /** 最后一项业务类型（与请求参数 business 对应） */
  business: HistoryBusinessType | "";
  /** 每页项数（与请求参数 ps 对应） */
  ps: number;
}

/** 历史记录筛选类型 */
export interface HistoryTabItem {
  /** 类型：archive|live|article 等 */
  type: HistoryFilterType | string;
  /** 类型名：视频/直播/专栏 等 */
  name: string;
}

/** 条目 history 字段（条目详细信息） */
export interface HistoryDetail {
  /** 目标 id（随业务不同含义不同） */
  oid: number;
  /** 剧集 epid（仅用于剧集） */
  epid?: number;
  /** 稿件 bvid（仅用于稿件） */
  bvid?: string;
  /** 观看到的视频分 P 数（仅用于稿件） */
  page?: number;
  /** 观看到的对象 id（稿件/剧集为 cid；文集为 cvid） */
  cid?: number;
  /** 观看到的视频分 P 标题（仅用于稿件） */
  part?: string;
  /** 业务类型 */
  business: HistoryBusinessType | string;
  /** 记录查看的平台代码：1/3/5/7 手机端，2 web 端，4/6 pad，9 智能音箱/游戏机，33 TV 端，0 其他 */
  dt?: number;
}

/** 历史记录列表项（不同业务字段可能为空） */
export interface HistoryListItem {
  /** 条目标题 */
  title: string;
  /** 条目副标题 */
  long_title: string;
  /** 条目封面图 url（专栏外） */
  cover: string;
  /** 条目封面图组（仅用于专栏，有效时为数组，无效为 null） */
  covers: string[] | null;
  /** 重定向 url（剧集/直播） */
  uri: string;
  /** 条目详细信息 */
  history: HistoryDetail;
  /** 视频分 P 数目（仅稿件） */
  videos?: number;
  /** UP 主昵称 */
  author_name?: string;
  /** UP 主头像 url */
  author_face?: string;
  /** UP 主 mid */
  author_mid?: number;
  /** 查看时间（时间戳） */
  view_at: number;
  /** 视频观看进度（秒，仅稿件/剧集） */
  progress?: number;
  /** 角标文案（稿件/剧集/笔记） */
  badge?: string;
  /** 分 P 标题（稿件/剧集） */
  show_title?: string;
  /** 视频总时长（秒，稿件/剧集） */
  duration?: number;
  /** (?) */
  current?: string;
  /** 总计分集数（仅剧集） */
  total?: number;
  /** 最新一话 / 最新一 P 标识（稿件/剧集） */
  new_desc?: string;
  /** 是否已完结（仅剧集） */
  is_finish?: 0 | 1;
  /** 是否收藏 */
  is_fav?: 0 | 1;
  /** 条目目标 id（与业务相关） */
  kid?: number;
  /** 子分区名（稿件/直播） */
  tag_name?: string;
  /** 直播状态（仅直播） */
  live_status?: 0 | 1;
}

/** data 结构 */
export interface WebInterfaceHistorySearchData {
  has_more: boolean;
  page: {
    /** 页码 */
    pn: number;
    /** 总页数 */
    total: number;
  };
  list: HistoryListItem[];
}

/** 顶层响应结构 */
export interface WebInterfaceHistorySearchResponse {
  /** 返回值：0 成功；-101 未登录；-400 请求错误 */
  code: number;
  /** 错误信息 */
  message: string;
  /** ttl 固定为 1 */
  ttl: number;
  /** 历史记录数据 */
  data: WebInterfaceHistorySearchData;
}

/**
 * 搜索历史记录
 */
export async function searchWebInterfaceHistory(params?: WebInterfaceHistorySearchParams) {
  return apiRequest.get<WebInterfaceHistorySearchResponse>("/x/web-interface/history/search", {
    params,
  });
}
