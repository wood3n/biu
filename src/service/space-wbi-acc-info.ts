import { apiRequest } from "./request";

/**
 * 用户空间详细信息 - 请求参数类型
 */
export interface SpaceAccInfoRequestParams {
  mid: number; // 目标用户mid
  w_rid: string; // Wbi 签名
  wts: number; // 当前时间戳
}

/**
 * 用户空间详细信息 - 响应类型
 */
export interface SpaceAccInfoResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -403:访问权限不足 -404:用户不存在
  message: string; // 错误信息
  ttl: number; // 1
  data: SpaceAccInfoData;
}

/**
 * 用户空间详细信息 - 数据类型
 */
export interface SpaceAccInfoData {
  mid: number; // 用户mid
  name: string; // 昵称
  sex: string; // 性别 男/女/保密
  face: string; // 头像链接
  face_nft: number; // 是否为 NFT 头像 0:不是 1:是
  face_nft_type: number; // NFT 头像类型
  sign: string; // 签名
  rank: number; // 用户权限等级
  level: number; // 当前等级 0-6级
  jointime: number; // 注册时间
  moral: number; // 节操值
  silence: number; // 封禁状态 0:正常 1:被封
  coins: number; // 硬币数
  fans_badge: boolean; // 是否具有粉丝勋章 false:无 true:有
  fans_medal: FansMedal; // 粉丝勋章信息
  official: Official; // 认证信息
  vip: Vip; // 会员信息
  pendant: Pendant; // 头像框信息
  nameplate: Nameplate; // 勋章信息
  user_honour_info: UserHonourInfo; // 用户荣誉信息
  is_followed: boolean; // 是否关注此用户
  top_photo: string; // 主页头图链接
  theme: Record<string, any>; // 主题信息
  sys_notice: SysNotice; // 系统通知
  live_room: LiveRoom; // 直播间信息
  birthday: string; // 生日 MM-DD
  school: School; // 学校信息
  profession: Profession; // 专业资质信息
  tags: string[] | null; // 个人标签
  series: Series; // 系列信息
  is_senior_member: number; // 是否为硬核会员 0:否 1:是
  mcn_info: null; // MCN信息
  gaia_res_type: number; // 未知字段
  gaia_data: null; // 未知字段
  is_risk: boolean; // 未知字段
  elec: Elec; // 充电信息
  contract: Contract; // 是否显示老粉计划
  certificate_show: boolean; // 未知字段
  name_render: Record<string, any> | null; // 昵称渲染信息
}

/**
 * 粉丝勋章信息
 */
export interface FansMedal {
  show: boolean;
  wear: boolean; // 是否佩戴了粉丝勋章
  medal: Medal; // 粉丝勋章详细信息
}

/**
 * 粉丝勋章详细信息
 */
export interface Medal {
  uid: number; // 此用户mid
  target_id: number; // 粉丝勋章所属UP的mid
  medal_id: number; // 粉丝勋章id
  level: number; // 粉丝勋章等级
  medal_name: string; // 粉丝勋章名称
  medal_color: number; // 颜色
  intimacy: number; // 当前亲密度
  next_intimacy: number; // 下一等级所需亲密度
  day_limit: number; // 每日亲密度获取上限
  today_feed: number; // 今日已获得亲密度
  medal_color_start: number; // 粉丝勋章颜色
  medal_color_end: number; // 粉丝勋章颜色
  medal_color_border: number; // 粉丝勋章边框颜色
  is_lighted: number;
  light_status: number;
  wearing_status: number; // 当前是否佩戴 0:未佩戴 1:已佩戴
  score: number;
}

/**
 * 认证信息
 */
export interface Official {
  role: number; // 认证类型
  title: string; // 认证信息
  desc: string; // 认证备注
  type: number; // 是否认证 -1:无 0:个人认证 1:机构认证
}

/**
 * 会员信息
 */
export interface Vip {
  type: number; // 会员类型 0:无 1:月大会员 2:年度及以上大会员
  status: number; // 会员状态 0:无 1:有
  due_date: number; // 会员过期时间 毫秒时间戳
  vip_pay_type: number; // 支付类型 0:未开启自动续费 1:已开启自动续费
  theme_type: number; // 作用尚不明确
  label: VipLabel; // 会员标签
  avatar_subscript: number; // 是否显示会员图标 0:不显示 1:显示
  nickname_color: string; // 会员昵称颜色
  role: number; // 大角色类型
  avatar_subscript_url: string; // 大会员角标地址
  tv_vip_status: number; // 电视大会员状态
  tv_vip_pay_type: number; // 电视大会员支付类型
  tv_due_date: number; // 电视大会员过期时间
  avatar_icon: AvatarIcon; // 大会员角标信息
}

/**
 * 会员标签
 */
export interface VipLabel {
  path: string;
  text: string; // 会员类型文案
  label_theme: string; // 会员标签
  text_color: string; // 会员标签
  bg_style: number;
  bg_color: string; // 会员标签背景颜色
  border_color: string; // 会员标签边框颜色
  use_img_label: boolean;
  img_label_uri_hans: string;
  img_label_uri_hant: string;
  img_label_uri_hans_static: string; // 大会员牌子图片 简体版
  img_label_uri_hant_static: string; // 大会员牌子图片 繁体版
}

/**
 * 大会员角标信息
 */
export interface AvatarIcon {
  icon_type: number;
  icon_resource: Record<string, any>;
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
  n_pid: number; // 新版头像框id
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
 * 用户荣誉信息
 */
export interface UserHonourInfo {
  mid: number;
  colour: string | null;
  tags: any[] | null;
}

/**
 * 系统通知
 */
export interface SysNotice {
  id: number; // id
  content: string; // 显示文案
  url: string; // 跳转地址
  notice_type: number; // 提示类型
  icon: string; // 前缀图标
  text_color: string; // 文字颜色
  bg_color: string; // 背景颜色
}

/**
 * 直播间信息
 */
export interface LiveRoom {
  roomStatus: number; // 直播间状态 0:无房间 1:有房间
  liveStatus: number; // 直播状态 0:未开播 1:直播中
  url: string; // 直播间网页 url
  title: string; // 直播间标题
  cover: string; // 直播间封面 url
  watched_show: WatchedShow;
  roomid: number; // 直播间 id
  roundStatus: number; // 轮播状态 0:未轮播 1:轮播
  broadcast_type: number;
}

/**
 * 观看信息
 */
export interface WatchedShow {
  switch: boolean;
  num: number; // 观看人数
  text_small: string;
  text_large: string;
  icon: string; // 观看图标 url
  icon_location: string;
  icon_web: string; // 网页观看图标 url
}

/**
 * 学校信息
 */
export interface School {
  name: string; // 就读大学名称
}

/**
 * 专业资质信息
 */
export interface Profession {
  name: string; // 资质名称
  department: string; // 职位
  title: string; // 所属机构
  is_show: number; // 是否显示 0:不显示 1:显示
}

/**
 * 系列信息
 */
export interface Series {
  user_upgrade_status: number;
  show_upgrade_window: boolean;
}

/**
 * 充电信息
 */
export interface Elec {
  show_info: ShowInfo; // 显示的充电信息
}

/**
 * 显示的充电信息
 */
export interface ShowInfo {
  show: boolean; // 是否显示充电按钮
  state: number; // 充电功能开启状态
  title: string; // 充电按钮显示文字
  icon: string; // 充电图标
  jump_url: string; // 跳转url
}

/**
 * 是否显示老粉计划
 */
export interface Contract {
  is_display: boolean;
  is_follow_display: boolean; // 是否在显示老粉计划
}

/**
 * 获取用户空间详细信息
 * @param params 请求参数，包含mid、w_rid和wts
 * @returns 用户空间详细信息
 */
export const getSpaceWbiAccInfo = (params: SpaceAccInfoRequestParams) => {
  return apiRequest.get<SpaceAccInfoResponse>("/x/space/wbi/acc/info", { params });
};
