import { apiRequest } from "./request";

/**
 * 获取视频合集(seasons_archives)信息 - 请求参数
 * GET /x/polymer/web-space/seasons_archives_list
 * 需验证 Referer，登录非必需
 */
export interface PolymerSeasonsArchivesListRequestParams {
  /** 用户 mid（必要） */
  mid: number;
  /** 视频合集 ID（必要） */
  season_id: number;
  /** 排序方式：true 升序，false/未传为默认排序（可选） */
  sort_reverse?: boolean;
  /** 页码（可选，默认 1） */
  page_num?: number;
  /** 单页数量（可选，默认 30） */
  page_size?: number;
  /** 风控验证（可选） */
  gaia_vtoken?: string;
  /** 页面位置（可选） */
  web_location?: string;
  /** WBI 签名（可选） */
  w_rid?: string;
  /** UNIX 秒级时间戳（可选，WBI 相关） */
  wts?: number;
}

/**
 * 获取视频合集(seasons_archives)信息 - 顶层响应
 */
export interface PolymerSeasonsArchivesListResponse {
  /** 返回值：0 成功；-352 请求被风控；-400 请求错误 */
  code: number;
  /** 错误信息（成功时一般为 "0"） */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: PolymerSeasonsArchivesListData;
}

/**
 * 信息本体
 */
export interface PolymerSeasonsArchivesListData {
  /** 稿件 avid 列表（与 archives 对应） */
  aids: number[];
  /** 合集中的视频列表 */
  archives: PolymerArchive[];
  /** 合集元数据 */
  meta: PolymerSeasonsMeta;
  /** 分页信息 */
  page: PolymerSeasonsPage;
}

/**
 * 合集内单个稿件信息
 */
export interface PolymerArchive {
  /** 稿件 avid */
  aid: number;
  /** 稿件 bvid */
  bvid: string;
  /** 创建时间（Unix 秒） */
  ctime: number;
  /** 时长（秒） */
  duration: number;
  /** 是否互动视频 */
  interactive_video?: boolean;
  /** 封面 URL */
  pic: string;
  /** 发布日期（Unix 秒） */
  pubdate: number;
  /** 状态码（0 正常） */
  state: number;
  /** 标题 */
  title: string;
  /** UGC 付费（0 否） */
  ugc_pay?: number;
  /** （部分场景出现） */
  enable_vt?: boolean;
  /** （部分场景出现） */
  vt_display?: string;
  /** 播放进度百分比；播放完成为 -1（可能出现） */
  playback_position?: number;
  /** 统计信息（常用 view） */
  stat: PolymerArchiveStat;
}

export interface PolymerArchiveStat {
  /** 播放量 */
  view: number;
  /** （部分接口存在） */
  vt?: number;
}

/**
 * 合集元数据
 */
export interface PolymerSeasonsMeta {
  category: number;
  /** 合集封面 */
  cover: string;
  /** 合集描述 */
  description: string;
  /** 创建者 mid */
  mid: number;
  /** 合集标题 */
  name: string;
  /** 发布时间（Unix 秒） */
  ptime: number;
  /** 合集 ID */
  season_id: number;
  /** 合集中视频总数 */
  total: number;
}

/**
 * 分页信息
 */
export interface PolymerSeasonsPage {
  /** 当前页码 */
  page_num: number;
  /** 单页数量 */
  page_size: number;
  /** 合集中视频总数 */
  total: number;
}

/**
 * 获取视频合集(seasons_archives)信息
 * - 说明：当被风控时可能需要 gaia_vtoken，部分场景支持 WBI 签名参数（w_rid/wts）
 * - 认证：Referer 验证；Cookie 登录非必需
 */
export function getPolymerSeasonsArchivesList(
  params: PolymerSeasonsArchivesListRequestParams,
): Promise<PolymerSeasonsArchivesListResponse> {
  return apiRequest.get<PolymerSeasonsArchivesListResponse>("/x/polymer/web-space/seasons_archives_list", {
    params,
  });
}
