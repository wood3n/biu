import { apiRequest } from "./request";
import { WebInterfaceViewData } from "./web-interface-view";

/**
 * 获取视频超详细信息(web端) - 请求参数
 */
export interface WebInterfaceViewDetailRequestParams {
  aid?: number; // 稿件avid
  bvid?: string; // 稿件bvid
  need_elec?: number; // 是否获取UP主充电信息 0:否 1:是
}

/**
 * 获取视频超详细信息(web端) - 响应类型
 */
export interface WebInterfaceViewDetailResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -403:权限不足 -404:无视频 62002:稿件不可见 62004:稿件审核中 62012:仅UP主自己可见
  message: string; // 错误信息
  ttl: number; // 1
  data: WebInterfaceViewDetailData;
}

/**
 * 获取视频超详细信息(web端) - 数据类型
 */
export interface WebInterfaceViewDetailData {
  View: WebInterfaceViewData; // 视频基本信息
  Card: Card; // 视频UP主信息
  Tags: Tag[]; // 视频TAG信息
  Reply: Reply; // 视频热评信息
  Related: WebInterfaceViewData[]; // 推荐视频信息
  Spec: null; // 作用尚不明确
  hot_share: HotShare; // 作用尚不明确
  elec: Elec | null; // 充电信息 当请求参数 need_elec=1 且有充电信息时有效
  recommend: null; // 作用尚不明确
  emergency: Emergency; // 视频操作按钮信息
  view_addit: ViewAddit; // 作用尚不明确
  guide: null; // 作用尚不明确
  query_tags: null; // 作用尚不明确
  participle: string[]; // 分词信息 用于推荐
  module_ctrl: null; // 作用尚不明确
  replace_recommend: boolean; // 作用尚不明确
}

export interface Official {
  role: number; // 认证角色 0:无 1:个人认证-知名UP主 2:个人认证-大V达人 3:机构认证-企业 4:机构认证-组织 5:机构认证-媒体 6:机构认证-政府 7:个人认证-高能主播 9:个人认证-社会知名人士
  title?: string; // 成员认证名
  type: number; // 认证类型 -1:无 0:有
  desc: string; // 认证信息
}

/**
 * 用户名片信息
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
  Official: Official; // 认证信息
  official_verify: OfficialVerify; // 认证信息2
  vip: Vip; // 会员信息
}

/**
 * 会员信息
 */
export interface Vip {
  type: number; // 成员会员类型 0: 无 1: 月会员 2: 年会员
  status: number; // 会员状态 0: 无 1: 有
  due_date: number; // 到期时间 UNIX 毫秒时间戳
  vip_pay_type: number; // 支付类型
  theme_type: number; // 主题类型 0
  label: VipLabel; // 会员标签
}

/**
 * 会员标签
 */
export interface VipLabel {
  path?: string; // 会员标签图片url
  text?: string; // 会员标签文字
  label_theme?: string; // 会员标签主题
  text_color?: string; // 会员标签文字颜色
  bg_style?: number; // 会员标签背景样式
  bg_color?: string; // 会员标签背景颜色
  border_color?: string; // 会员标签边框颜色
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
  expire: number; // 过期时间 0:永久
  image_enhance: string; // 头像框图片url
  image_enhance_frame: string; // 头像框图片url
}

/**
 * 勋章信息
 */
export interface Nameplate {
  nid: number; // 勋章id
  name: string; // 勋章名称
  image: string; // 勋章图片url
  image_small: string; // 勋章小图片url
  level: string; // 勋章等级
  condition: string; // 获取条件
}

/**
 * 认证信息2
 */
export interface OfficialVerify {
  type: number; // 认证类型 -1:无 0:个人认证 1:机构认证
  desc: string; // 认证信息
}

/**
 * 视频TAG信息
 */
export interface Tag {
  tag_id: number; // 标签id
  tag_name: string; // 标签名
  cover: string; // 封面图片url
  head_cover: string; // 小封面图片url
  content: string; // 标签内容描述
  short_content: string; // 标签内容简短描述
  type: number; // 作用尚不明确
  state: number; // 作用尚不明确
  ctime: number; // 创建时间 时间戳
  count: Count; // 状态数
  is_atten: number; // 是否关注 0:未关注 1:已关注
  likes: number; // 点赞数
  hates: number; // 点踩数
  attribute: number; // 属性位配置
  liked: number; // 是否已点赞 0:未点赞 1:已点赞
  hated: number; // 是否已点踩 0:未点踩 1:已点踩
  extra_attr: number; // 额外属性
}

/**
 * 标签状态数
 */
export interface Count {
  view: number; // 播放数
  use: number; // 使用数
  atten: number; // 关注数
}

/**
 * 视频热评信息
 */
export interface Reply {
  page: Page; // 页面信息
  replies: ReplyItem[] | null; // 评论列表
  config: Config; // 配置信息
  cursor: Cursor; // 游标信息
  hots: ReplyItem[] | null; // 热评列表
  top: ReplyItem | null; // 置顶评论
  notice: null; // 作用尚不明确
  upper: Upper; // UP主信息
  top_replies: ReplyItem[] | null; // 置顶评论列表
}

/**
 * 页面信息
 */
export interface Page {
  num: number; // 当前页码
  size: number; // 每页项数
  count: number; // 总评论数
  acount: number; // 总评论数
}

/**
 * 评论条目
 */
export interface ReplyItem {
  rpid: number; // 评论id
  oid: number; // 评论区id
  type: number; // 评论区类型
  mid: number; // 评论者mid
  root: number; // 根评论id
  parent: number; // 父评论id
  dialog: number; // 会话id
  count: number; // 回复数
  rcount: number; // 回复数
  state: number; // 状态
  fansgrade: number; // 是否具有粉丝标签 0:无 1:有
  attr: number; // 属性位
  ctime: number; // 发送时间 时间戳
  rpid_str: string; // 评论id字符串
  root_str: string; // 根评论id字符串
  parent_str: string; // 父评论id字符串
  like: number; // 点赞数
  action: number; // 当前用户操作状态
  member: Member; // 评论者信息
  content: Content; // 评论内容
  replies: ReplyItem[] | null; // 回复列表
  assist: number; // 辅助信息
  folder: Folder; // 折叠信息
  up_action: UpAction; // UP主操作信息
  show_follow: boolean; // 是否显示关注按钮
  invisible: boolean; // 是否隐藏
  reply_control: ReplyControl; // 评论控制信息
}

/**
 * 评论者信息
 */
export interface Member {
  mid: string; // 评论者mid
  uname: string; // 评论者昵称
  sex: string; // 评论者性别 男 女 保密
  sign: string; // 评论者签名
  avatar: string; // 评论者头像url
  rank: string; // 评论者等级
  face_nft_new: number; // 是否为NFT头像 0:否 1:是
  is_senior_member: number; // 是否为高级会员 0:否 1:是
  level_info: LevelInfo; // 等级信息
  pendant: Pendant; // 头像框信息
  nameplate: Nameplate; // 勋章信息
  official_verify: OfficialVerify; // 认证信息
  vip: any; // 会员信息
  fans_detail: FansDetail | null; // 粉丝详情
  user_sailing: UserSailing; // 用户装扮信息
  is_contractor: boolean; // 是否为承包商
  contract_desc: string; // 承包商描述
  nft_interaction: null; // NFT互动信息
  avatar_item: AvatarItem; // 头像信息
}

/**
 * 粉丝详情
 */
export interface FansDetail {
  uid: number; // 用户mid
  medal_id: number; // 粉丝勋章id
  medal_name: string; // 粉丝勋章名称
  score: number; // 粉丝勋章积分
  level: number; // 粉丝勋章等级
  intimacy: number; // 粉丝勋章亲密度
  master_status: number; // 是否为勋章拥有者 0:否 1:是
  is_receive: number; // 是否已领取 0:否 1:是
  medal_color: number; // 粉丝勋章颜色
  medal_color_start: number; // 粉丝勋章颜色起始值
  medal_color_end: number; // 粉丝勋章颜色结束值
  medal_color_border: number; // 粉丝勋章边框颜色
  name_color: string; // 粉丝勋章名称颜色
  icon_id: number; // 粉丝勋章图标id
  medal_icon: string; // 粉丝勋章图标url
  guard_level: number; // 大航海等级 0:非舰长 1:总督 2:提督 3:舰长
  guard_icon: string; // 大航海图标url
  honor_icon: string; // 荣誉图标url
}

/**
 * 用户装扮信息
 */
export interface UserSailing {
  pendant: null; // 头像框信息
  cardbg: null; // 卡片背景信息
  cardbg_with_focus: null; // 卡片背景信息
}

/**
 * 头像信息
 */
export interface AvatarItem {
  container_size: ContainerSize; // 容器大小
  fallback_layers: FallbackLayer; // 备用层
  mid: string; // 用户mid
}

/**
 * 容器大小
 */
export interface ContainerSize {
  width: number; // 宽度
  height: number; // 高度
}

/**
 * 备用层
 */
export interface FallbackLayer {
  is_critical_group: boolean; // 是否为关键组
  layers: Layer[]; // 层列表
}

/**
 * 层信息
 */
export interface Layer {
  visible: boolean; // 是否可见
  general_spec: GeneralSpec; // 通用规格
  layer_config: LayerConfig; // 层配置
  resource: Resource; // 资源信息
}

/**
 * 通用规格
 */
export interface GeneralSpec {
  pos_spec: PosSpec; // 位置规格
  size_spec: SizeSpec; // 大小规格
  render_spec: RenderSpec; // 渲染规格
}

/**
 * 位置规格
 */
export interface PosSpec {
  coordinate_pos: number; // 坐标位置
  axis_x: number; // X轴
  axis_y: number; // Y轴
}

/**
 * 大小规格
 */
export interface SizeSpec {
  width: number; // 宽度
  height: number; // 高度
}

/**
 * 渲染规格
 */
export interface RenderSpec {
  opacity: number; // 不透明度
}

/**
 * 层配置
 */
export interface LayerConfig {
  tags: Tags; // 标签
  is_critical: boolean; // 是否为关键层
  layer_mask: LayerMask; // 层掩码
}

/**
 * 标签
 */
export interface Tags {
  AVATAR_LAYER: AvatarLayer; // 头像层
}

/**
 * 头像层
 */
export interface AvatarLayer {
  src_type: number; // 源类型
  is_user_avatar: boolean; // 是否为用户头像
}

/**
 * 层掩码
 */
export interface LayerMask {
  general_spec: GeneralSpec; // 通用规格
  mask_src: MaskSrc; // 掩码源
}

/**
 * 掩码源
 */
export interface MaskSrc {
  src_type: number; // 源类型
  draw: Draw; // 绘制信息
}

/**
 * 绘制信息
 */
export interface Draw {
  draw_type: number; // 绘制类型
  fill_mode: number; // 填充模式
  color_config: ColorConfig; // 颜色配置
}

/**
 * 颜色配置
 */
export interface ColorConfig {
  day: Day; // 日间模式
}

/**
 * 日间模式
 */
export interface Day {
  argb: string; // ARGB颜色值
}

/**
 * 资源信息
 */
export interface Resource {
  res_type: number; // 资源类型
  res_image: ResImage; // 资源图片
}

/**
 * 资源图片
 */
export interface ResImage {
  image_src: ImageSrc; // 图片源
}

/**
 * 图片源
 */
export interface ImageSrc {
  src_type: number; // 源类型
  placeholder: number; // 占位符
  remote: Remote; // 远程信息
}

/**
 * 远程信息
 */
export interface Remote {
  url: string; // 图片url
  bfs_style: string; // BFS样式
}

/**
 * 评论内容
 */
export interface Content {
  message: string; // 评论内容
  members: Member[]; // 评论中@的用户信息
  jump_url: Record<string, JumpUrl>; // 跳转链接
  max_line: number; // 最大行数
}

/**
 * 跳转链接
 */
export interface JumpUrl {
  title: string; // 标题
  prefix_icon: string; // 前缀图标
  app_url_schema: string; // APP URL Schema
  app_name: string; // APP名称
  app_package_name: string; // APP包名
  click_report: string; // 点击上报
  is_half_screen: boolean; // 是否半屏
  exposure_report: string; // 曝光上报
  extra: Extra; // 额外信息
  underline: boolean; // 是否有下划线
  match_once: boolean; // 是否只匹配一次
  pc_url: string; // PC URL
  icon_position: number; // 图标位置
}

/**
 * 额外信息
 */
export interface Extra {
  goods_show_type: number; // 商品展示类型
  is_word_search: boolean; // 是否为词搜索
  is_commerce_goods: boolean; // 是否为商业商品
  is_sensitive: boolean; // 是否敏感
}

/**
 * 折叠信息
 */
export interface Folder {
  has_folded: boolean; // 是否已折叠
  is_folded: boolean; // 是否折叠
  rule: string; // 折叠规则
}

/**
 * UP主操作信息
 */
export interface UpAction {
  like: boolean; // 是否点赞
  reply: boolean; // 是否回复
}

/**
 * 评论控制信息
 */
export interface ReplyControl {
  sub_reply_entry_text: string; // 子回复入口文本
  sub_reply_title_text: string; // 子回复标题文本
  time_desc: string; // 时间描述
}

/**
 * 配置信息
 */
export interface Config {
  showtopic: boolean; // 是否显示话题
  show_up_flag: boolean; // 是否显示UP主标志
  read_only: boolean; // 是否只读
}

/**
 * 游标信息
 */
export interface Cursor {
  is_begin: boolean; // 是否为开始
  prev: number; // 上一页
  next: number; // 下一页
  is_end: boolean; // 是否为结束
  mode: number; // 模式
  mode_text: string; // 模式文本
  all_count: number; // 总数
  support_mode: number[]; // 支持的模式
  name: string; // 名称
}

/**
 * UP主信息
 */
export interface Upper {
  mid: number; // UP主mid
}

/**
 * 热门分享
 */
export interface HotShare {
  show: boolean; // 是否显示
  list: any[]; // 列表
}

/**
 * 充电信息
 */
export interface Elec {
  show: boolean; // 是否显示
  total: number; // 总数
  count: number; // 数量
  list: ElecItem[]; // 列表
  elec_set: ElecSet; // 充电设置
  elec_theme: string; // 充电主题
  round_count: number; // 轮次数
  share_url: string; // 分享链接
}

/**
 * 充电条目
 */
export interface ElecItem {
  mid: number; // 用户mid
  pay_mid: number; // 支付mid
  rank: number; // 排名
  uname: string; // 用户名
  avatar: string; // 头像
  message: string; // 留言
  msg_deleted: number; // 留言是否已删除 0:未删除 1:已删除
  vip_info: VipInfo; // 会员信息
  trend_type: number; // 趋势类型
}

/**
 * 会员信息
 */
export interface VipInfo {
  vipType: number; // 会员类型 0:无 1:月度大会员 2:年度及以上大会员
  vipStatus: number; // 会员开通状态 0:无 1:有
  vipDueDate: number; // 会员到期时间 毫秒时间戳
}

/**
 * 充电设置
 */
export interface ElecSet {
  elec_theme: string; // 充电主题
  integrity_rate: number; // 完整率
  rmb_rate: number; // 人民币汇率
  round_mode: number; // 轮次模式
  elec_list: ElecListItem[]; // 充电列表
  custom: Custom[]; // 自定义
}

/**
 * 充电列表条目
 */
export interface ElecListItem {
  title: string; // 标题
  elec_num: number; // 充电数量
  is_customize: number; // 是否自定义 0:否 1:是
}

/**
 * 自定义
 */
export interface Custom {
  min: number; // 最小值
  max: number; // 最大值
  def_tip: string; // 默认提示
}

/**
 * 视频操作按钮信息
 */
export interface Emergency {
  no_like: boolean; // 是否不显示点赞按钮
  no_coin: boolean; // 是否不显示投币按钮
  no_fav: boolean; // 是否不显示收藏按钮
  no_share: boolean; // 是否不显示分享按钮
}

/**
 * 视频附加信息
 */
export interface ViewAddit {
  [key: string]: boolean; // 是否不显示某些功能
}

/**
 * 获取视频超详细信息(web端)
 * @param params 请求参数
 * @returns Promise<WebInterfaceViewDetailResponse>
 */
export const getWebInterfaceViewDetail = (params: WebInterfaceViewDetailRequestParams) => {
  return apiRequest.get<WebInterfaceViewDetailResponse>("/x/web-interface/view/detail", { params });
};
