import { omitBy } from "es-toolkit/object";

import { apiRequest } from "./request";

/**
 * 上报视频播放心跳（web端）- URL 参数
 */
export interface ClickInterfaceWebHeartbeatUrlParams {
  /** 事件开始时间戳，对应请求正文的 start_ts */
  w_start_ts?: number;
  /** 当前用户 mid，对应请求正文的 mid */
  w_mid?: number;
  /** 稿件 aid，对应请求正文的 aid */
  w_aid?: number;
  /** 固定为 2 */
  w_dt?: number;
  /** 本轮页面会话真实播放时间（秒），对应 realtime */
  w_realtime?: number;
  /** 视频播放进度（秒），对应 played_time */
  w_playedtime?: number;
  /** 本轮页面会话真实视频播放持续时间（秒），对应 real_played_time */
  w_real_played_time?: number;
  /** 视频时长（秒），对应 video_duration */
  w_video_duration?: number;
  /** 最大播放进度与 played_time 之和（秒），对应 last_play_progress_time */
  w_last_play_progress_time?: number;
  /** 网页位置编码，默认为视频详情页播放器 1315873 */
  web_location?: number;
  /** WBI 签名，useWbi 模式下无需手动填充 */
  w_rid?: string;
  /** UNIX 秒级时间戳，useWbi 模式下无需手动填充 */
  wts?: number;
}

/**
 * 上报视频播放心跳（web端）- 表单参数
 */
export interface ClickInterfaceWebHeartbeatRequestBody {
  /** 稿件 avid，aid 与 bvid 二选一 */
  aid?: number;
  /** 稿件 bvid，aid 与 bvid 二选一 */
  bvid?: string;
  /** 视频 cid（用于分 P） */
  cid?: number;
  /**  番剧 epid */
  epid?: number;
  /** 番剧 ssid */
  sid?: number;
  /** 当前用户 mid */
  mid?: number;
  /** 视频播放进度（秒），完成为 -1 */
  played_time?: number;
  /** 本轮页面会话真实播放时间（秒） */
  realtime?: number;
  /** 本轮页面会话真实视频播放持续时间（秒） */
  real_played_time?: number;
  /** 与请求头 Referer 相同的地址 */
  refer_url?: string;
  /** 视频清晰度，对应 qn 视频清晰度标识 */
  quality?: number;
  /** 视频总时长（秒） */
  video_duration?: number;
  /** play_time 与本轮页面会话开始时 played_time 之和 */
  last_play_progress_time?: number;
  /** 本轮页面会话所有最大 last_play_progress_time 与开始时 played_time 之和 */
  max_play_progress_time?: number;
  /** 开始播放时刻的时间戳 */
  start_ts?: number;
  /** 视频类型：3 投稿视频 / 4 剧集 / 10 课程 */
  type?: number;
  /** 剧集副类型：0 普通投稿 / 1 番剧 / 2 电影 / 3 纪录片 / 4 国创 / 5 电视剧 / 7 综艺 */
  sub_type?: number;
  /** 固定为 2 */
  dt?: number;
  /** 固定为 0 */
  outer?: number;
  /** 333.788.0.0 */
  spmid?: string;
  /** 播放来源，例如 444.41.list.card_archive.click */
  from_spmid?: string;
  /** 会话信息，通常为一串无分隔小写 UUID */
  session?: string;
  /** 额外信息，如播放器版本 {"player_version":"4.8.36"} */
  extra?: Record<string, unknown> | string;
  /** 播放动作：0 播放中 / 1 开始播放 / 2 暂停 / 3 继续播放 / 4 结束播放 */
  play_type?: number;
  /** CSRF Token（即 Cookie 中 bili_jct），Cookie 模式建议传入 */
  csrf?: string;
}

/**
 * 上报视频播放心跳（web端）- 响应
 */
export interface ClickInterfaceWebHeartbeatResponse {
  /** 返回值 0：成功 -400：请求错误 */
  code: number;
  /** 错误信息，默认为 0 */
  message: string;
  /** 固定为 1 */
  ttl: number;
}

/**
 * 上报视频播放心跳（web端）
 */
export function postClickInterfaceWebHeartbeat(
  data: ClickInterfaceWebHeartbeatRequestBody,
  params?: ClickInterfaceWebHeartbeatUrlParams,
): Promise<ClickInterfaceWebHeartbeatResponse> {
  return apiRequest.post<ClickInterfaceWebHeartbeatResponse>(
    "/x/click-interface/web/heartbeat",
    omitBy(data, value => value === undefined || value === null || value === ""),
    {
      params,
      useFormData: true,
      useCSRF: true,
      useWbi: true,
    },
  );
}
