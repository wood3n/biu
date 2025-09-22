import { apiRequest } from "./request";

/**
 * 批量获取指定收藏id的内容 - 请求参数
 * 请求方式：GET
 */
export interface FavResourceInfosRequestParams {
  /** 目标内容 id 列表，格式：{内容id}:{内容类型}，多个以逗号分隔
   * 内容类型：2:视频稿件 12:音频
   * 内容 id：视频稿件 avid / 音频 auid
   * 例："583785685:2,15664:12"
   */
  resources: string;
  /** 平台标识，可为 web（影响内容列表类型） */
  platform?: string;
}

/**
 * 批量获取指定收藏id的内容 - 响应类型
 */
export interface FavResourceInfosResponse {
  /** 返回值 0:成功 -400:请求错误 */
  code: number;
  /** 错误信息 默认为 "0" */
  message: string;
  /** 有效时为数组，无效或为 null */
  data: FavResourceInfo[] | null;
}

/**
 * 内容信息
 */
export interface FavResourceInfo {
  /** 内容 id（视频稿件 avid / 音频 auid） */
  id: number;
  /** 内容类型：2:视频稿件 12:音频 */
  type: number;
  /** 标题 */
  title: string;
  /** 封面 url */
  cover: string;
  /** 简介 */
  intro: string;
  /** 视频分 P 数 */
  page: number;
  /** 音频/视频时长（秒） */
  duration: number;
  /** UP 主信息 */
  upper: FavResourceInfoUpper;
  /** 属性：0:正常 1:失效 */
  attr: number;
  /** 状态数 */
  cnt_info: FavResourceInfoCntInfo;
  /** 跳转 uri */
  link: string;
  /** 投稿时间 时间戳 */
  ctime: number;
  /** 发布时间 时间戳 */
  pubtime: number;
  /** 收藏时间 时间戳 */
  fav_time: number;
  /** 视频稿件 bvid（文档有两字段，保持一致） */
  bv_id: string;
  /** 视频稿件 bvid（同上） */
  bvid: string;
  /** 未知字段（文档为 null） */
  season: null;
}

/**
 * UP 主信息
 */
export interface FavResourceInfoUpper {
  /** UP 主 mid */
  mid: number;
  /** UP 主昵称 */
  name: string;
  /** UP 主头像 url */
  face: string;
}

/**
 * 状态数
 */
export interface FavResourceInfoCntInfo {
  /** 收藏数 */
  collect: number;
  /** 播放数 */
  play: number;
  /** 弹幕数 */
  danmaku: number;
}

/**
 * 批量获取指定收藏id的内容
 * @param params 请求参数
 * @returns Promise<FavResourceInfosResponse>
 */
export const getFavResourceInfos = (params: FavResourceInfosRequestParams) => {
  return apiRequest.get<FavResourceInfosResponse>("/x/v3/fav/resource/infos", { params });
};
