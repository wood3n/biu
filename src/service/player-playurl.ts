import { apiRequest } from "./request";

/**
 * 获取视频流地址(web端) - 请求参数
 */
export interface PlayerPlayurlRequestParams {
  avid?: number; // 稿件avid
  bvid?: string; // 稿件bvid
  cid: number | string; // 视频cid
  qn?: number; // 视频清晰度选择 未登录默认32(480P) 登录后默认64(720P)
  /** 视频流格式标识 默认1(MP4格式) 16:DASH格式，4048:所有可用 DASH 视频流 */
  fnval?: number;
  fnver?: number; // 固定为0
  fourk?: number; // 是否允许4K视频 0:画质最高1080P(默认) 1:画质最高4K
  session?: string; // 从视频播放页的HTML中设置window.__playinfo__处获取
  platform?: string; // pc:web播放(默认) html5:移动端HTML5播放
  high_quality?: number; // 是否高画质 platform=html5时,此值为1可使画质为1080p
  try_look?: number; // 未登录高画质 为1时可以不登录拉到64和80清晰度
  gaia_source?: string; // view-card 无Cookie(SESSDATA)时需要此参数
}

/**
 * 获取视频流地址(web端) - 响应类型
 */
export interface PlayerPlayurlResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -404:无视频
  message: string; // 错误信息
  ttl: number; // 1
  data: PlayerPlayurlData;
}

/**
 * 获取视频流地址(web端) - 数据类型
 */
export interface PlayerPlayurlData {
  v_voucher?: string; // (?) 需要参数gaia_source=view-card
  from: string; // local?
  result: string; // suee?
  message: string; // 空?
  quality: number; // 清晰度标识
  format: string; // 视频格式 mp4/flv
  timelength: number; // 视频长度 单位为毫秒
  accept_format: string; // 支持的全部格式 每项用,分隔
  accept_description: string[]; // 支持的清晰度列表(文字说明)
  accept_quality: number[]; // 支持的清晰度列表(代码)
  video_codecid: number; // 默认选择视频流的编码id
  seek_param: string; // start?
  seek_type: string; // offset(DASH/FLV)? second(MP4)?
  durl?: Durl[]; // 视频分段流信息 注:仅FLV/MP4格式存在此字段
  dash?: Dash; // DASH流信息 注:仅DASH格式存在此字段
  support_formats: SupportFormat[]; // 支持格式的详细信息
  high_format: null; // (?)
  last_play_time?: number; // 上次播放进度 毫秒值
  last_play_cid?: number; // 上次播放分P的cid
}

/**
 * 视频分段流信息
 */
export interface Durl {
  order: number; // 视频分段序号
  length: number; // 视频分段长度 单位为毫秒
  size: number; // 视频分段大小 单位为Byte
  ahead: string; // (?) 空?
  vhead: string; // (?) 空?
  url: string; // 视频分段URL
  backup_url: string[]; // 备用视频分段URL
}

/**
 * DASH流信息
 */
export interface Dash {
  duration: number; // 视频长度 单位为秒
  minBufferTime: number; // 最小缓冲区时间 单位为秒
  min_buffer_time: number; // 最小缓冲区时间 单位为秒
  video: DashVideo[]; // DASH格式视频流列表
  audio: DashAudio[]; // DASH格式音频流列表
  dolby?: DolbyInfo; // 杜比全景声音频流
  flac?: FlacInfo; // 无损音频流
}

/**
 * DASH格式视频流
 */
export interface DashVideo {
  id: number; // 视频清晰度代码
  baseUrl: string; // 视频流URL
  base_url: string; // 视频流URL
  backupUrl: string[]; // 备用视频流URL
  backup_url: string[]; // 备用视频流URL
  bandwidth: number; // 视频流码率
  mimeType: string; // 视频流格式类型
  mime_type: string; // 视频流格式类型
  codecs: string; // 视频流编码
  width: number; // 视频宽度
  height: number; // 视频高度
  frameRate: string; // 视频帧率
  frame_rate: string; // 视频帧率
  sar: string; // 1:1
  startWithSap: number; // 1
  start_with_sap: number; // 1
  SegmentBase: SegmentBase; // 分段基础信息
  segment_base: SegmentBase; // 分段基础信息
  codecid: number; // 视频编码id
}

/**
 * DASH格式音频流
 */
export interface DashAudio {
  id: number;
  baseUrl: string; // 音频流URL
  base_url: string; // 音频流URL
  backupUrl: string[]; // 备用音频流URL
  backup_url: string[]; // 备用音频流URL
  bandwidth: number; // 音频流码率
  mimeType: string; // 音频流格式类型
  mime_type: string; // 音频流格式类型
  codecs: string; // 音频流编码
  width: number; // 0
  height: number; // 0
  frameRate: string; // 音频帧率
  frame_rate: string; // 音频帧率
  sar: string; // 1:1
  startWithSap: number; // 0
  start_with_sap: number; // 0
  SegmentBase: SegmentBase; // 分段基础信息
  segment_base: SegmentBase; // 分段基础信息
  codecid: number; // 音频编码id
}

/**
 * 分段基础信息
 */
export interface SegmentBase {
  Initialization: string; // 初始化范围
  initialization: string; // 初始化范围
  indexRange: string; // 索引范围
  index_range: string; // 索引范围
}

/**
 * 杜比全景声音频流
 */
export interface DolbyInfo {
  type: number; // 类型
  audio: DashAudio[]; // 杜比全景声音频流列表
}

/**
 * 无损音频流
 */
export interface FlacInfo {
  display: boolean; // 是否显示
  audio: DashAudio; // 无损音频流
}

/**
 * 支持格式的详细信息
 */
export interface SupportFormat {
  quality: number; // 视频清晰度代码
  format: string; // 视频格式
  new_description: string; // 格式描述
  display_desc: string; // 格式描述
  superscript: string; // 格式右上角标
  codecs: string[]; // 编码格式列表
}

/**
 * 获取视频流地址(web端)
 * 获取 url 有效时间为 120min，超时失效需要重新获取
 */
export const getPlayerPlayurl = (params: PlayerPlayurlRequestParams) => {
  return apiRequest.get<PlayerPlayurlResponse>("/x/player/wbi/playurl", { params, useWbi: true });
};
