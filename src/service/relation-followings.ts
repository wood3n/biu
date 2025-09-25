import { apiRequest } from "./request";

/**
 * 查询用户关注明细 - 请求参数
 * 请求方式：GET
 * 认证方式：Cookie（SESSDATA）或 APP
 * 本接口只有登录、标头 referer 为 bilibili.com 下的子域名、UA 不含 python 时才会返回列表
 * 登录可看当前用户全部，其他用户仅可查看前 100 个，访问超过 100 个时返回空列表（但 code 值为 0）
 */
export interface RelationFollowingsRequestParams {
  /** APP 登录 Token（APP 方式必要） */
  access_key?: string;
  /** 目标用户 mid（必要） */
  vmid: number;
  /** 排序方式（仅当目标用户为自己时有效）：按照关注顺序排列：留空；按照最常访问排列：attention */
  order_type?: "" | "attention";
  /** 每页项数，默认为 50 */
  ps?: number;
  /** 页码，默认为 1（其他用户仅可查看前 100 个） */
  pn?: number;
}

/**
 * 查询用户关注明细 - 顶层响应
 */
export interface RelationFollowingsResponse {
  /** 返回值：0 成功；-101 账号未登录；-352 请求被拦截；-400 请求错误；22115 用户已设置隐私，无法查看 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: RelationFollowingsData;
}

/**
 * 查询用户关注明细 - data
 */
export interface RelationFollowingsData {
  /** 明细列表 */
  list: RelationListItem[];
  /** （？） */
  re_version?: number;
  /** 关注总数 */
  total: number;
}

/**
 * 关系列表对象（followings/fans等接口通用）
 * 以下说明中的“目标用户”指被查询的用户，“对方”指返回的关系列表中的用户。
 */
export interface RelationListItem {
  /** 用户 mid */
  mid: number;
  /** 对方对于自己的关系属性：0 未关注；1 悄悄关注（已下线）；2 已关注；6 已互粉；128 已拉黑 */
  attribute: number;
  /** 对方关注目标用户时间（秒级时间戳，互关后刷新） */
  mtime?: number;
  /** 目标用户将对方分组到的 id 列表，无分组为 null */
  tag: number[] | null;
  /** 目标用户特别关注对方标识：0 否；1 是 */
  special: number;
  /** 契约计划相关信息 */
  contract_info?: ContractInfo;
  /** 用户昵称 */
  uname: string;
  /** 用户头像 url */
  face: string;
  /** 用户签名 */
  sign: string;
  /** 是否为 NFT 头像：0 否；1 是 */
  face_nft?: number;
  /** 认证信息 */
  official_verify?: OfficialVerify;
  /** 会员信息 */
  vip?: UserVip;
  /** 昵称渲染信息，有效时为对象，否则为 null */
  name_render?: Record<string, any> | null;
  /** （？） */
  nft_icon?: string;
  /** 推荐该用户的原因（大多数情况下为空；如：xxx 关注了 TA） */
  rec_reason?: string;
  /** 内部记录 id（大多数情况下为空） */
  track_id?: string;
  /** （？） */
  follow_time?: string;
}

/** 契约计划相关信息 */
export interface ContractInfo {
  /** 目标用户是否为对方的契约者（仅当为 true 时才有此项） */
  is_contract?: boolean;
  /** 对方是否为目标用户的契约者（仅当为 true 时才有此项） */
  is_contractor?: boolean;
  /** 对方成为目标用户的契约者的时间（秒级时间戳，且仅当 is_contractor 为 true 时存在） */
  ts?: number;
  /** 对方作为目标用户的契约者的属性：1 老粉，否则为原始粉丝（仅当有特殊属性时才有此项） */
  user_attr?: number;
}

/** 认证信息 */
export interface OfficialVerify {
  /** 用户认证类型：-1 无；0 UP 主认证；1 机构认证 */
  type: number;
  /** 用户认证信息（无为空） */
  desc: string;
}

/** 会员标签（不同接口字段可能更丰富，这里保留常见字段） */
export interface VipLabel {
  /** 标签路径（有的接口仅返回 path） */
  path?: string;
  /** 以下字段在部分接口中存在 */
  text?: string;
  label_theme?: string;
  text_color?: string;
  bg_style?: number;
  bg_color?: string;
  border_color?: string;
}

/** 会员信息 */
export interface UserVip {
  /** 会员类型：0 无；1 月度大会员；2 年度以上大会员 */
  vipType: number;
  /** 会员到期时间（毫秒时间戳） */
  vipDueDate: number;
  /** （？） */
  dueRemark?: string;
  /** （？） */
  accessStatus?: number;
  /** 大会员状态：0 无；1 有 */
  vipStatus: number;
  /** （？） */
  vipStatusWarn?: string;
  /** （？） */
  themeType?: number;
  /** 会员标签 */
  label?: VipLabel;
}

/**
 * 查询用户关注明细
 * - 认证：Cookie（SESSDATA）或 APP
 * - 说明：当目标用户为自己时，可通过 order_type=attention 按“最常访问”排序；默认按照关注顺序
 */
export function getRelationFollowings(params: RelationFollowingsRequestParams): Promise<RelationFollowingsResponse> {
  return apiRequest.get<RelationFollowingsResponse>("/x/relation/followings", { params });
}
