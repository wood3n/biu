import { apiRequest } from "./request";

/**
 * 导航栏用户信息 - 响应类型
 */
export interface GetUserInfoResponse {
  code: number; // 返回值 0:成功 -101:账号未登录
  message: string; // 错误信息
  ttl: number; // 1
  data: UserInfo;
}

/**
 * 导航栏用户信息 - 数据类型
 */
export interface UserInfo {
  isLogin: boolean; // 是否已登录 false:未登录 true:已登录
  email_verified: number; // 是否验证邮箱地址 0:未验证 1:已验证
  face: string; // 用户头像 url
  face_nft?: number; // 是否为 NFT 头像 0:不是 1:是
  face_nft_type?: number; // NFT 头像类型
  level_info: LevelInfo; // 等级信息
  mid: number; // 用户 mid
  mobile_verified: number; // 是否验证手机号 0:未验证 1:已验证
  money: number; // 拥有硬币数
  moral: number; // 当前节操值 上限为70
  official: Official; // 认证信息
  officialVerify: OfficialVerify; // 认证信息 2
  pendant: Pendant; // 头像框信息
  scores: number; // （？）
  uname: string; // 用户昵称
  vipDueDate: number; // 会员到期时间 毫秒时间戳
  vipStatus: number; // 会员开通状态 0:无 1:有
  vipType: number; // 会员类型 0:无 1:月度大会员 2:年度及以上大会员
  vip_pay_type: number; // 会员开通状态 0:无 1:有
  vip_theme_type: number; // （？）
  vip_label: VipLabel; // 会员标签
  vip_avatar_subscript: number; // 是否显示会员图标 0:不显示 1:显示
  vip_nickname_color: string; // 会员昵称颜色 颜色码
  wallet: Wallet; // B币钱包信息
  has_shop: boolean; // 是否拥有推广商品 false:无 true:有
  shop_url: string; // 商品推广页面 url
  allowance_count: number; // （？）
  answer_status: number; // （？）
  is_senior_member: number; // 是否硬核会员 0:非硬核会员 1:硬核会员
  wbi_img: WbiImg; // Wbi 签名实时口令 该字段即使用户未登录也存在
  is_jury: boolean; // 是否风纪委员 true:风纪委员 false:非风纪委员
}

/**
 * 等级信息
 */
export interface LevelInfo {
  current_level: number; // 当前等级
  current_min: number; // 当前等级经验最低值
  current_exp: number; // 当前经验
  next_exp: number | string; // 升级下一等级需达到的经验 当用户等级为Lv6时，值为"--"，代表无穷大
}

/**
 * 认证信息
 */
export interface Official {
  role: number; // 认证类型 见用户认证类型一览
  title: string; // 认证信息 无为空
  desc: string; // 认证备注 无为空
  type: number; // 是否认证 -1:无 0:认证
}

/**
 * 认证信息 2
 */
export interface OfficialVerify {
  type: number; // 是否认证 -1:无 0:认证
  desc: string; // 认证信息 无为空
}

/**
 * 头像框信息
 */
export interface Pendant {
  pid: number; // 挂件id
  name: string; // 挂件名称
  image: string; // 挂件图片url
  expire: number; // （？）
  image_enhance?: string; // 挂件增强图片
  image_enhance_frame?: string; // 挂件增强边框
}

/**
 * 会员标签
 */
export interface VipLabel {
  path: string; // （？）
  text: string; // 会员名称
  label_theme: string; // 会员标签 vip:大会员 annual_vip:年度大会员 ten_annual_vip:十年大会员 hundred_annual_vip:百年大会员
  text_color?: string; // 文字颜色
  bg_style?: number; // 背景样式
  bg_color?: string; // 背景颜色
  border_color?: string; // 边框颜色
  use_img_label?: boolean; // 是否使用图片标签
  img_label_uri_hans?: string; // 简体中文图片标签URI
  img_label_uri_hant?: string; // 繁体中文图片标签URI
  img_label_uri_hans_static?: string; // 简体中文静态图片标签URI
  img_label_uri_hant_static?: string; // 繁体中文静态图片标签URI
}

/**
 * B币钱包信息
 */
export interface Wallet {
  mid: number; // 登录用户mid
  bcoin_balance: number; // 拥有B币数
  coupon_balance: number; // 每月奖励B币数
  coupon_due_time: number; // （？）
}

/**
 * Wbi 签名实时口令
 */
export interface WbiImg {
  img_url: string; // Wbi 签名参数 imgKey的伪装 url 详见文档 Wbi 签名
  sub_url: string; // Wbi 签名参数 subKey的伪装 url 详见文档 Wbi 签名
}

/**
 * 获取导航栏用户信息
 * @returns 导航栏用户信息
 */
export const getUserInfo = () => {
  return apiRequest.get<GetUserInfoResponse>("/x/web-interface/nav");
};
