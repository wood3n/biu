import { apiRequest } from "./request";

/**
 * 用户名片信息 - 请求参数类型
 */
export interface WebInterfaceCardRequestParams {
  mid: number; // 目标用户mid
  photo?: boolean; // 是否请求用户主页头图 true:是 false:否
}

/**
 * 用户名片信息 - 响应类型
 */
export interface WebInterfaceCardResponse {
  code: number; // 返回值 0:成功 -400:请求错误
  message: string; // 错误信息
  ttl: number; // 1
  data: UserAccount;
}

/**
 * 用户名片信息 - 数据类型
 */
export interface UserAccount {
  card: Card; // 卡片信息
  following: boolean; // 是否关注此用户 true:已关注 false:未关注
  archive_count: number; // 用户稿件数
  article_count: number; // 文章数
  follower: number; // 粉丝数
  like_num: number; // 点赞数
}

/**
 * 用户卡片信息
 */
export interface Card {
  mid: string; // 用户mid
  approve: boolean; // 作用尚不明确
  name: string; // 用户昵称
  sex: string; // 用户性别 男 女 保密
  face: string; // 用户头像链接
  DisplayRank: string; // 作用尚不明确
  regtime: number; // 注册时间
  spacesta: number; // 用户状态 0:正常 -2:被封禁
  birthday: string; // 生日
  place: string; // 地区
  description: string; // 描述
  article: number; // 文章数
  attentions: any[]; // 关注列表
  fans: number; // 粉丝数
  friend: number; // 关注数
  attention: number; // 关注数
  sign: string; // 签名
  level_info: LevelInfo; // 等级信息
  pendant: Pendant; // 头像框信息
  nameplate: Nameplate; // 勋章信息
  official_verify: OfficialVerify; // 认证信息
  vip: Vip; // 会员信息
}

/**
 * 等级信息
 */
export interface LevelInfo {
  current_level: number; // 当前等级
  current_min: number; // 当前等级最小经验值
  current_exp: number; // 当前经验值
  next_exp: number; // 下一等级经验值
}

/**
 * 头像框信息
 */
export interface Pendant {
  pid: number; // 头像框id
  name: string; // 头像框名称
  image: string; // 头像框图片url
  expire: number; // 过期时间
  image_enhance: string; // 头像框图片url
  image_enhance_frame: string; // 头像框图片逐帧序列url
}

/**
 * 勋章信息
 */
export interface Nameplate {
  nid: number; // 勋章id
  name: string; // 勋章名称
  image: string; // 勋章图标
  image_small: string; // 勋章图标(小)
  level: string; // 勋章等级
  condition: string; // 获取条件
}

/**
 * 认证信息
 */
export interface OfficialVerify {
  type: number; // 认证类型 -1:无 0:个人认证 1:机构认证
  desc: string; // 认证信息
}

/**
 * 会员信息
 */
export interface Vip {
  vipType: number; // 会员类型 0:无 1:月大会员 2:年度及以上大会员
  vipDueDate: number; // 会员过期时间 毫秒时间戳
  dueRemark: string; // 会员过期提醒
  accessStatus: number; // 会员开通状态
  vipStatus: number; // 会员状态 0:无 1:有
  vipStatusWarn: string; // 会员状态警告
  themeType: number; // 主题类型
  label: VipLabel; // 会员标签
  avatar_subscript: number; // 是否显示会员图标 0:不显示 1:显示
  nickname_color: string; // 会员昵称颜色
}

/**
 * 会员标签
 */
export interface VipLabel {
  path: string;
  text: string; // 会员类型文案
  label_theme: string; // 会员标签
  text_color: string; // 会员标签文字颜色
  bg_style: number;
  bg_color: string; // 会员标签背景颜色
  border_color: string; // 会员标签边框颜色
}

/**
 * 获取用户名片信息
 * @param params 请求参数，包含mid和可选的photo
 * @returns 用户名片信息
 */
export const getWebInterfaceCard = (params: WebInterfaceCardRequestParams) => {
  return apiRequest.get<WebInterfaceCardResponse>("/x/web-interface/card", { params });
};
