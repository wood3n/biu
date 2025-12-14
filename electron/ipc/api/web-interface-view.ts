import got from "got";

import { getCookieString } from "../../network/cookie";
import { UserAgent } from "../../network/user-agent";

/**
 * 获取视频详细信息(web端) - 请求参数
 */
export interface WebInterfaceViewRequestParams {
  aid?: number; // 稿件avid
  bvid?: string; // 稿件bvid
}

/**
 * 获取视频详细信息(web端) - 响应类型
 */
export interface WebInterfaceViewResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -403:权限不足 -404:无视频 62002:稿件不可见 62004:稿件审核中 62012:仅UP主自己可见
  message: string; // 错误信息
  ttl: number; // 1
  data: WebInterfaceViewData;
}

/**
 * 获取视频详细信息(web端) - 数据类型
 */
export interface WebInterfaceViewData {
  bvid: string; // 稿件bvid
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
  desc_v2: DescV2[] | null; // 新版视频简介
  state: number; // 稿件状态
  duration: number; // 稿件总时长(所有分P)
  rights: Rights; // 稿件权限信息
  owner: Owner; // UP主信息
  stat: Stat; // 稿件状态数
  dynamic: string; // 稿件动态文字
  cid: number; // 视频1P cid
  dimension: Dimension; // 视频1P分辨率
  premiere: any | null; // 首播状态
  teenage_mode: number; // 青少年模式
  is_chargeable_season: boolean; // 是否为付费电影
  is_story: boolean; // 是否为有剧情的动画
  no_cache: boolean; // 是否禁止缓存
  pages: Page[]; // 分P列表
  subtitle: Subtitle; // 字幕信息
  staff: Staff[] | null; // 合作成员列表
  is_season_display: boolean; // 是否为多季节内容
  user_garb: UserGarb; // 用户装扮信息
  honor_reply: HonorReply; // 荣誉回复
  like_icon: string; // 点赞图标
  need_jump_bv: boolean; // 是否需要跳转到BV号
}

/**
 * 新版视频简介
 */
export interface DescV2 {
  raw_text: string; // 简介文字
  type: number; // 简介类型
  biz_id: number; // 业务id
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
  evaluation: string; // 评价
  argue_msg: string; // 争议信息
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
 * 分P信息
 */
export interface Page {
  cid: number; // 分P cid
  page: number; // 分P序号，从1开始
  from: string; // 视频来源 vupload:普通上传(B站) hunan:芒果TV qq:腾讯
  part: string; // 分P标题
  duration: number; // 分P持续时间 单位为秒
  vid: string; // 站外视频vid
  weblink: string; // 站外视频跳转url
  dimension: Dimension; // 分P分辨率
  first_frame: string; // 分P封面
}

/**
 * 字幕信息
 */
export interface Subtitle {
  allow_submit: boolean; // 是否允许提交字幕
  list: SubtitleItem[]; // 字幕列表
}

/**
 * 字幕条目
 */
export interface SubtitleItem {
  id: number; // 字幕id
  lan: string; // 字幕语言
  lan_doc: string; // 字幕语言名称
  is_lock: boolean; // 是否锁定
  author_mid: number; // 字幕上传者mid
  subtitle_url: string; // json格式字幕文件url
  author: SubtitleAuthor; // 字幕上传者信息
}

/**
 * 字幕上传者信息
 */
export interface SubtitleAuthor {
  mid: number; // 字幕上传者mid
  name: string; // 字幕上传者昵称
  sex: string; // 字幕上传者性别 男 女 保密
  face: string; // 字幕上传者头像url
  sign: string; // 字幕上传者签名
  rank: number; // 作用尚不明确
  birthday: number; // 作用尚不明确
  is_fake_account: number; // 作用尚不明确
  is_deleted: number; // 作用尚不明确
}

/**
 * 合作成员信息
 */
export interface Staff {
  mid: number; // 成员mid
  title: string; // 成员名称
  name: string; // 成员昵称
  face: string; // 成员头像url
  vip: Vip; // 成员大会员状态
  official: Official; // 成员认证信息
  follower: number; // 成员粉丝数
  label_style: number; // 标签样式
}

/**
 * 会员信息
 */
export interface Vip {
  type: number; // 成员会员类型 0:无 1:月会员 2:年会员
  status: number; // 会员状态 0:无 1:有
  due_date: number; // 到期时间 UNIX 毫秒时间戳
  vip_pay_type: number; // 支付类型
  theme_type: number; // 主题类型
  label: VipLabel; // 会员标签
}

/**
 * 会员标签
 */
export interface VipLabel {
  path: string; // 会员标签图片url
  text: string; // 会员标签文字
  label_theme: string; // 会员标签主题
  text_color: string; // 会员标签文字颜色
  bg_style: number; // 会员标签背景样式
  bg_color: string; // 会员标签背景颜色
  border_color: string; // 会员标签边框颜色
}

/**
 * 认证信息
 */
export interface Official {
  role: number; // 成员认证级别 见用户认证类型一览
  title: string; // 成员认证名 无为空
  desc: string; // 成员认证备注 无为空
  type: number; // 成员认证类型 -1:无 0:有
}

/**
 * 用户装扮信息
 */
export interface UserGarb {
  url_image_ani_cut: string; // 某url
}

/**
 * 荣誉回复
 */
export interface HonorReply {
  honor: Honor[];
}

/**
 * 荣誉信息
 */
export interface Honor {
  aid: number; // 当前稿件aid
  type: number; // 1:入站必刷收录 2:第?期每周必看 3:全站排行榜最高第?名 4:热门
  desc: string; // 描述
  weekly_recommend_num: number; // 每周推荐数
}

/**
 * 获取视频详细信息(web端)
 * @param params 请求参数
 * @returns Promise<WebInterfaceViewResponse>
 */
export const getWebInterfaceView = async (params: WebInterfaceViewRequestParams) => {
  const cookie = await getCookieString();

  const { body } = await got.get("https://api.bilibili.com/x/web-interface/view", {
    headers: {
      "User-Agent": UserAgent,
      Cookie: cookie,
      Referer: "https://www.bilibili.com/",
    },
    searchParams: params as Record<string, any>,
    responseType: "json",
  });

  return body as WebInterfaceViewResponse;
};
