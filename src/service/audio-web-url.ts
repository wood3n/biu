import { biliRequest } from "./request";

/**
 * 获取音频流URL（可获取付费音频）
 * GET https://api.bilibili.com/audio/music-service-c/url
 * 认证：APP（access_key）或 Cookie（SESSDATA）
 */
export interface AudioStreamUrlRequestParams {
  /** APP 登录 Token（APP 方式必要） */
  access_key?: string;
  /** 音频 auid（必要） */
  songid: number | string;
  /** 音质代码（必要：0=128K，1=192K，2=320K，3=FLAC） */
  quality: number;
  /** 必须为 2（必要） */
  privilege?: number;
  /** 当前用户 mid（必要，可为任意值） */
  mid: number;
  /** 平台标识（必要，可为任意值，如 'pc' 或 'android'） */
  platform: string;
}

/**
 * 可用音质项
 */
export interface AudioStreamQuality {
  /** 音质代码 */
  type: number;
  /** 音质名称 */
  desc: string;
  /** 该音质的文件大小（字节） */
  size: number;
  /** 比特率标签 */
  bps: string;
  /** 音质标签 */
  tag: string;
  /** 是否需要会员权限：0 不需要；1 需要 */
  require: number;
  /** 会员权限标签 */
  requiredesc: string;
}

/**
 * 音频流URL（可获取付费音频）- 数据本体
 */
export interface AudioStreamUrlData {
  /** 音频 auid */
  sid: number;
  /** 音质标识：-1 试听片段；0 128K；1 192K；2 320K；3 FLAC */
  type: number;
  /** 作用尚不明确，通常为空字符串 */
  info: string;
  /** 有效时长（秒），一般为 3 小时 */
  timeout: number;
  /** 文件大小（字节）；当 type 为 -1 时为 0 */
  size: number;
  /** 音频流 URL 列表（主/备） */
  cdns: string[];
  /** 音质列表 */
  qualities: AudioStreamQuality[];
  /** 音频标题 */
  title: string;
  /** 音频封面 url */
  cover: string;
}

/**
 * 音频流URL（可获取付费音频）- 顶层响应
 */
export interface AudioStreamUrlResponse {
  /** 返回值：0 成功；7201006 未找到或下架；72000000 请求错误 */
  code: number;
  /** 错误信息，默认为 "success" */
  msg: string;
  /** 数据本体 */
  data: AudioStreamUrlData;
}

/**
 * 获取音频流URL（可获取付费音频）
 * @param params 请求参数
 */
export const getAudioWebStreamUrl = (params: AudioStreamUrlRequestParams) => {
  return biliRequest.get<AudioStreamUrlResponse>("/audio/music-service-c/web/url", { params });
};
