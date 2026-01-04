import { apiRequest } from "./request";

/**
 * 用户导航栏状态数（/x/space/navnum） - 请求参数
 * 请求方式：GET
 */
export interface SpaceNavnumRequestParams {
  /** 目标用户 mid（必要） */
  mid: number | string;
  /** 额外定位（可选） */
  web_location?: string;
}

/**
 * 用户导航栏状态数（/x/space/navnum） - channel
 */
export interface SpaceNavnumChannel {
  /** 视频列表数（全部） */
  master: number;
  /** 视频列表数（公开） */
  guest: number;
}

/**
 * 用户导航栏状态数（/x/space/navnum） - favourite
 */
export interface SpaceNavnumFavourite {
  /** 全部收藏夹数（需登录，仅自己可见） */
  master: number;
  /** 公开收藏夹数 */
  guest: number;
}

/**
 * 用户导航栏状态数（/x/space/navnum） - data
 */
export interface SpaceNavnumData {
  /** 投稿视频数 */
  video: number;
  /** 追番数（无视隐私设置） */
  bangumi: number;
  /** 追剧数（无视隐私设置） */
  cinema: number;
  /** 视频列表数 */
  channel: SpaceNavnumChannel;
  /** 收藏夹数 */
  favourite: SpaceNavnumFavourite;
  /** 关注 TAG 数（无视隐私设置） */
  tag: number;
  /** 投稿专栏数 */
  article: number;
  /** 作用尚不明确 */
  playlist: number;
  /** 投稿图文数 */
  album: number;
  /** 投稿音频数 */
  audio: number;
  /** 投稿课程数 */
  pugv: number;
  /** 视频合集数 */
  season_num: number;
  /** 动态数（有的文档叫 opus） */
  opus?: number;
}

/**
 * 用户导航栏状态数（/x/space/navnum） - 顶层响应
 */
export interface SpaceNavnumResponse {
  /** 返回值 0：成功；-400：请求错误 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: SpaceNavnumData;
}

/**
 * 查询用户导航栏状态数
 */
export function getSpaceNavnum(params: SpaceNavnumRequestParams): Promise<SpaceNavnumResponse> {
  return apiRequest.get<SpaceNavnumResponse>("/x/space/navnum", { params });
}
