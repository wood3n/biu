import { apiRequest } from "./request";

/**
 * 获取分区视频排行榜列表 - 请求参数
 */
export interface WebInterfaceRankingRequestParams {
  rid?: number; // 目标分区 tid，默认为 0 (全站)，音乐分区为 3
  type?: string; // 排行榜类型，全部: all 新人: rokkie 原创: origin
  web_location?: string; // 333.934
  w_rid?: string; // WBI 签名
  wts?: number; // Unix 时间戳
}

/**
 * 获取分区视频排行榜列表 - 响应类型
 */
export interface WebInterfaceRankingResponse {
  code: number; // 返回值 0:成功 -400:请求错误
  message: string; // 错误信息
  ttl: number; // 1
  data: WebInterfaceRankingData;
}

/**
 * 获取分区视频排行榜列表 - 数据类型
 */
export interface WebInterfaceRankingData {
  note: string; // 说明文字，一般为"根据稿件内容质量、近期的数据综合展示，动态更新"
  list: WebInterfaceRankingItem[]; // 视频列表
}

/**
 * 获取分区视频排行榜列表 - 视频条目
 */
export interface WebInterfaceRankingItem {
  aid: number; // 稿件avid
  videos: number; // 视频数
  tid: number; // 分区tid
  tname: string; // 子分区名称
  copyright: number; // 版权类型 1:原创 2:转载
  pic: string; // 稿件封面图片url
  title: string; // 稿件标题
  pubdate: number; // 稿件发布时间戳
  ctime: number; // 稿件审核通过时间戳
  desc: string; // 稿件简介
  state: number; // 稿件状态
  duration: number; // 稿件总时长(所有分P)
  mission_id?: number; // 稿件参与的活动id
  rights: Rights; // 稿件权限信息
  owner: Owner; // UP主信息
  stat: Stat; // 稿件状态数
  dynamic: string; // 稿件动态文字
  cid: number; // 视频1P cid
  dimension: Dimension; // 视频1P分辨率
  season_id?: number; // 稿件所属的季度id
  short_link: string; // 稿件短链接
  short_link_v2: string; // 稿件短链接V2
  first_frame: string; // 第一帧截图url
  pub_location?: string; // 视频发布地点
  bvid: string; // 稿件bvid
  score: number; // 综合评分
}

/**
 * 稿件权限信息
 */
export interface Rights {
  bp: number; // 是否允许承包
  elec: number; // 是否允许充电
  download: number; // 是否允许下载
  movie: number; // 是否电影
  pay: number; // 是否付费
  hd5: number; // 是否有高码率
  no_reprint: number; // 是否禁止转载
  autoplay: number; // 是否自动播放
  ugc_pay: number; // 是否UGC付费
  is_cooperation: number; // 是否联合投稿
  ugc_pay_preview: number; // 是否UGC付费预览
  no_background: number; // 是否无背景
  arc_pay: number; // 是否电影付费
  pay_free_watch: number; // 是否付费免观看
}

/**
 * UP主信息
 */
export interface Owner {
  mid: number; // UP主mid
  name: string; // UP主昵称
  face: string; // UP主头像
}

/**
 * 稿件状态数
 */
export interface Stat {
  aid: number; // 稿件avid
  view: number; // 播放数
  danmaku: number; // 弹幕数
  reply: number; // 评论数
  favorite: number; // 收藏数
  coin: number; // 投币数
  share: number; // 分享数
  now_rank: number; // 当前排名
  his_rank: number; // 历史最高排名
  like: number; // 点赞数
  dislike: number; // 点踩数
}

/**
 * 视频分辨率
 */
export interface Dimension {
  width: number; // 宽度
  height: number; // 高度
  rotate: number; // 是否旋转 0:否 1:是
}

/**
 * 获取分区视频排行榜列表
 * @param params 请求参数
 * @returns Promise<WebInterfaceRankingResponse>
 */
export const getWebInterfaceRanking = (params?: WebInterfaceRankingRequestParams) => {
  return apiRequest.get<WebInterfaceRankingResponse>("/x/web-interface/ranking/v2", { params });
};
