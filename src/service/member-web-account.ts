import { apiRequest } from "./request";

/**
 * 获取我的信息 - 响应类型
 */
export interface MemberWebAccountResponse {
  code: number; // 返回值 0:成功 -101:账号未登录 -400:请求错误
  message: string; // 错误信息
  ttl: number; // 1
  data: MemberWebAccountData;
}

/**
 * 获取我的信息 - 数据类型
 */
export interface MemberWebAccountData {
  mid: number; // 我的mid
  uname: string; // 我的昵称
  userid: string; // 我的用户名
  sign: string; // 我的签名
  birthday: string; // 我的生日 MM-DD
  sex: string; // 我的性别 男 女 保密
  nick_free: boolean; // 是否未设置昵称 false:已设置 true:未设置
  rank: number; // 我的会员等级
  face: string; // 我的头像链接
  face_nft: number; // 是否为 NFT 头像 0:不是 1:是
  face_nft_new: number; // 是否为 NFT 头像 0:不是 1:是
  level_info: LevelInfo; // 等级信息
  moral: number; // 节操值 一般为0
  silence: number; // 封禁状态 0:正常 1:被封
  coins: number; // 硬币数
  fans_badge: boolean; // 是否拥有粉丝勋章 false:无 true:有
  fans_medal: FansMedal; // 粉丝勋章信息
  official: Official; // 认证信息
  vip: Vip; // 会员信息
  pendant: Pendant; // 头像框信息
  nameplate: Nameplate; // 勋章信息
  is_followed: boolean; // 是否关注自己 恒为false
  top_photo: string; // 主页头图链接
  theme: object; // 空对象
  sys_notice: object; // 系统通知信息
  live_room: LiveRoom; // 直播间信息
  birthday_party: object; // 生日特权信息
  is_senior_member: number; // 是否为硬核会员 0:否 1:是
  is_jury: boolean; // 是否是风纪委员 false:否 true:是
  is_risk: boolean; // 是否存在风险 false:否 true:是
  is_forbidden: boolean; // 是否被封禁 false:否 true:是
  pin_prompting: boolean; // 未知
  profession: Profession; // 职业信息
  face_dress: object; // 头像装扮信息
  gaia_res_type: number; // 未知
  gaia_data: object; // 未知
  is_birthday: boolean; // 是否生日 false:否 true:是
  action_card: object; // 未知
  allowance_count: number; // 未知
  answer_status: number; // 未知
  login_info: object; // 登录信息
  email_verified: number; // 是否验证邮箱 0:未验证 1:已验证
  tel_status: number; // 是否绑定手机 0:未绑定 1:已绑定
  identification: number; // 是否实名认证 0:未认证 1:已认证
  invite_relation: object; // 邀请关系信息
  is_tourist: boolean; // 是否为游客 false:否 true:是
  has_tourist: boolean; // 是否有游客身份 false:否 true:是
  is_deleted: boolean; // 是否注销 false:否 true:是
  has_preview_audit: boolean; // 是否有预览审核 false:否 true:是
  preview_audit_status: number; // 预览审核状态
  privacy_settings: object; // 隐私设置信息
  has_no_content: boolean; // 是否无内容 false:否 true:是
  safe_mode: boolean; // 是否安全模式 false:否 true:是
  account_info: AccountInfo; // 账号信息
  is_steins: boolean; // 未知
  is_upower_exclusive: boolean; // 是否为 Upower 独家 false:否 true:是
  is_upower_user: boolean; // 是否为 Upower 用户 false:否 true:是
  is_upower_double: boolean; // 是否为 Upower 双倍 false:否 true:是
  is_upower_gray: boolean; // 是否为 Upower 灰度 false:否 true:是
  upower_expire_time: number; // Upower 过期时间
  upower_point: number; // Upower 点数
  upower_rank: number; // Upower 等级
  upower_rank_name: string; // Upower 等级名称
  upower_rank_v2: number; // Upower 等级 v2
  upower_rank_v2_name: string; // Upower 等级 v2 名称
  upower_user_flag: number; // Upower 用户标志
  upower_user_type: number; // Upower 用户类型
  upower_user_type_name: string; // Upower 用户类型名称
  upower_icon: string; // Upower 图标
  upower_icon_name: string; // Upower 图标名称
  upower_icon_bg: string; // Upower 图标背景
  upower_icon_bg_name: string; // Upower 图标背景名称
  upower_icon_gray: string; // Upower 图标灰度
  upower_icon_gray_name: string; // Upower 图标灰度名称
  upower_icon_gray_bg: string; // Upower 图标灰度背景
  upower_icon_gray_bg_name: string; // Upower 图标灰度背景名称
  upower_icon_double: string; // Upower 图标双倍
  upower_icon_double_name: string; // Upower 图标双倍名称
  upower_icon_double_bg: string; // Upower 图标双倍背景
  upower_icon_double_bg_name: string; // Upower 图标双倍背景名称
  upower_icon_web: string; // Upower 图标网页
  upower_icon_web_name: string; // Upower 图标网页名称
  upower_icon_web_bg: string; // Upower 图标网页背景
  upower_icon_web_bg_name: string; // Upower 图标网页背景名称
  upower_icon_web_gray: string; // Upower 图标网页灰度
  upower_icon_web_gray_name: string; // Upower 图标网页灰度名称
  upower_icon_web_gray_bg: string; // Upower 图标网页灰度背景
  upower_icon_web_gray_bg_name: string; // Upower 图标网页灰度背景名称
  upower_icon_web_double: string; // Upower 图标网页双倍
  upower_icon_web_double_name: string; // Upower 图标网页双倍名称
  upower_icon_web_double_bg: string; // Upower 图标网页双倍背景
  upower_icon_web_double_bg_name: string; // Upower 图标网页双倍背景名称
}

/**
 * 等级信息
 */
export interface LevelInfo {
  current_level: number; // 当前等级
  current_min: number; // 当前等级最低经验值
  current_exp: number; // 当前经验值
  next_exp: number; // 下一等级经验值 0表示当前等级已经是最高等级
}

/**
 * 粉丝勋章信息
 */
export interface FansMedal {
  show: boolean; // 是否显示粉丝勋章 false:不显示 true:显示
  wear: boolean; // 是否佩戴粉丝勋章 false:不佩戴 true:佩戴
  medal: Medal; // 粉丝勋章信息
}

/**
 * 粉丝勋章
 */
export interface Medal {
  uid: number; // 用户mid
  target_id: number; // 主播mid
  medal_id: number; // 粉丝勋章id
  level: number; // 粉丝勋章等级
  medal_name: string; // 粉丝勋章名称
  medal_color: number; // 粉丝勋章颜色
  intimacy: number; // 粉丝勋章亲密度
  next_intimacy: number; // 下一等级粉丝勋章亲密度
  day_limit: number; // 每日亲密度上限
  medal_color_start: number; // 粉丝勋章颜色起始值
  medal_color_end: number; // 粉丝勋章颜色结束值
  medal_color_border: number; // 粉丝勋章边框颜色
  is_lighted: number; // 是否点亮 0:未点亮 1:已点亮
  light_status: number; // 点亮状态 0:未点亮 1:已点亮
  wearing_status: number; // 佩戴状态 0:未佩戴 1:已佩戴
  score: number; // 粉丝勋章积分
}

/**
 * 认证信息
 */
export interface Official {
  role: number; // 认证类型 0:无 1 2 3 4 5 6 7 8 9
  title: string; // 认证信息
  desc: string; // 认证备注
  type: number; // 认证类型 -1:无 0:个人认证 1:机构认证
}

/**
 * 会员信息
 */
export interface Vip {
  type: number; // 会员类型 0:无 1:月度大会员 2:年度及以上大会员
  status: number; // 会员状态 0:无 1:有
  due_date: number; // 会员过期时间 毫秒时间戳
  vip_pay_type: number; // 支付类型 0:未支付 1:已支付
  theme_type: number; // 主题类型 0:无 1:有
  label: VipLabel; // 会员标签
  avatar_subscript: number; // 是否显示会员图标 0:不显示 1:显示
  nickname_color: string; // 会员昵称颜色
  role: number; // 会员身份 1:月度 3:年度 7:十年
  avatar_subscript_url: string; // 会员角标图片url
  tv_vip_status: number; // 电视大会员状态 0:无 1:有
  tv_vip_pay_type: number; // 电视大会员支付类型 0:未支付 1:已支付
  tv_due_date: number; // 电视大会员过期时间 毫秒时间戳
}

/**
 * 会员标签
 */
export interface VipLabel {
  path: string; // 空字符串
  text: string; // 会员类型文案
  label_theme: string; // 会员标签主题 vip:大会员
  text_color: string; // 会员文字颜色
  bg_style: number; // 背景样式 0:无 1:有
  bg_color: string; // 会员标签背景颜色
  border_color: string; // 会员标签边框颜色
  use_img_label: boolean; // 是否使用图片标签 false:不使用 true:使用
  img_label_uri_hans: string; // 简体中文图片标签链接
  img_label_uri_hant: string; // 繁体中文图片标签链接
  img_label_uri_hans_static: string; // 简体中文静态图片标签链接
  img_label_uri_hant_static: string; // 繁体中文静态图片标签链接
}

/**
 * 头像框信息
 */
export interface Pendant {
  pid: number; // 头像框id
  name: string; // 头像框名称
  image: string; // 头像框图片链接
  expire: number; // 过期时间 0:永久 毫秒时间戳
  image_enhance: string; // 头像框增强版图片链接
  image_enhance_frame: string; // 头像框增强版边框图片链接
  n_pid: number; // 未知
}

/**
 * 勋章信息
 */
export interface Nameplate {
  nid: number; // 勋章id
  name: string; // 勋章名称
  image: string; // 勋章图片链接
  image_small: string; // 勋章小图片链接
  level: string; // 勋章等级
  condition: string; // 获取条件
}

/**
 * 直播间信息
 */
export interface LiveRoom {
  roomStatus: number; // 直播间状态 0:无房间 1:有房间
  liveStatus: number; // 直播状态 0:未开播 1:直播中
  url: string; // 直播间网页 url
  title: string; // 直播间标题
  cover: string; // 直播间封面链接
  roomid: number; // 直播间 id
  roundStatus: number; // 轮播状态 0:未轮播 1:轮播
  broadcast_type: number; // 直播类型 0:普通直播 1:投稿视频轮播 2:直播剪辑 3:通用轮播
  watched_show: WatchedShow; // 观看信息
}

/**
 * 观看信息
 */
export interface WatchedShow {
  switch: boolean; // 是否显示观看信息 false:不显示 true:显示
  num: number; // 观看人数
  text_small: string; // 观看信息文本
  text_large: string; // 观看信息文本
  icon: string; // 观看信息图标
  icon_location: number; // 观看信息图标位置
  icon_web: string; // 观看信息网页图标
}

/**
 * 职业信息
 */
export interface Profession {
  id: number; // 职业id
  name: string; // 职业名称
  show_name: string; // 职业显示名称
  is_show: number; // 是否显示 0:不显示 1:显示
  category_one: string; // 职业一级分类
  realname: string; // 实名
  title: string; // 职称
  department: string; // 部门
  certificate_no: string; // 证书编号
  certificate_show: boolean; // 是否显示证书 false:不显示 true:显示
}

/**
 * 账号信息
 */
export interface AccountInfo {
  hide_tel: string; // 隐藏的手机号
  hide_mail: string; // 隐藏的邮箱
  bind_tel: boolean; // 是否绑定手机 false:未绑定 true:已绑定
  bind_mail: boolean; // 是否绑定邮箱 false:未绑定 true:已绑定
  tel_verify: boolean; // 是否验证手机 false:未验证 true:已验证
  mail_verify: boolean; // 是否验证邮箱 false:未验证 true:已验证
  unneeded_check: boolean; // 是否无需检查 false:需要 true:不需要
  is_senior_member: number; // 是否为硬核会员 0:否 1:是
}

/**
 * 获取我的信息
 * @returns 我的信息
 */
export function getMemberWebAccount(): Promise<MemberWebAccountResponse> {
  return apiRequest.get<MemberWebAccountResponse>("/x/member/web/account");
}
