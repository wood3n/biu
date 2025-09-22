import { apiRequest } from "./request";

/** 稍后再看视频条目（字段与 web 接口一致，尽量精确建模） */
export interface ToViewVideoItem {
  aid: number; // 稿件avid
  videos: number; // 分P总数
  tid: number; // 分区tid
  tname: string; // 子分区名称
  copyright: number; // 1原创 2转载
  pic: string; // 封面
  title: string; // 标题
  pubdate: number; // 发布时间戳
  ctime: number; // 用户提交时间戳
  desc: string; // 简介
  state: number; // 状态（详见 web-interface-view.ts 中 state 备注）
  /**
   * 历史保留字段 attribute（文档称该字段已删除，接口偶尔仍可见，这里不强制）
   * 若后端实际不返回可为 undefined
   */
  attribute?: number;
  duration: number; // 总时长（秒）
  rights: import("./web-interface-view").Rights; // 权限信息
  owner: import("./web-interface-view").Owner; // UP 主
  stat: import("./web-interface-view").Stat; // 状态数
  dynamic: string; // 动态文字
  dimension: import("./web-interface-view").Dimension; // 1P 分辨率
  /** 非投稿可能没有该字段 */
  count?: number;
  cid: number; // 视频cid
  progress: number; // 观看进度（秒）
  add_at: number; // 添加时间戳
  bvid: string; // 稿件bvid
}

export interface HistoryToViewListResponse {
  code: number; // 0 成功 -101 未登录 -400 请求错误
  message: string; // 错误信息
  ttl: number; // 1
  data: {
    count: number; // 稍后再看视频数
    list: ToViewVideoItem[]; // 列表
  };
}

/**
 * 获取稍后再看视频列表 - GET /x/v2/history/toview
 */
export async function getHistoryToViewList(): Promise<HistoryToViewListResponse> {
  return apiRequest.get<HistoryToViewListResponse>("/x/v2/history/toview");
}
