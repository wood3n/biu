import { apiRequest } from "./request";

/**
 * 查询用户收藏的视频收藏夹 - 请求参数
 * 请求方式：GET
 */
export interface FavFolderCollectedListRequestParams {
  /** 每页项数 定义域 1 - 大于70 */
  ps: number;
  /** 页码 */
  pn: number;
  /** 目标用户 mid */
  up_mid: number | string;
  /** 平台类型，填写 web 返回值才会包含用户收藏的视频合集 */
  platform?: string;
}

/**
 * 查询用户收藏的视频收藏夹 - 响应类型
 */
export interface FavFolderCollectedListResponse {
  /** 返回值 0:成功 -101:账号未登录 -111:csrf校验失败 40022:签名过长 */
  code: number;
  /** 错误信息 默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，隐藏时为 null，公开时为对象 */
  data: FavFolderCollectedListData | null;
}

/**
 * 查询用户收藏的视频收藏夹 - data
 */
export interface FavFolderCollectedListData {
  /** 创建的收藏夹数 */
  count: number;
  /** 收藏夹列表，无收藏夹时为 null */
  list: FavFolderCollectedItem[] | null;
  /** 是否有更多数据 */
  has_more: boolean;
}

/**
 * 收藏夹条目
 */
export interface FavFolderCollectedItem {
  /** 收藏夹 */
  id: number;
  /** 类型 11：视频收藏夹 21：视频合集 */
  type: number;
  /** 原始收藏夹 mlid（去除两位 mid 尾号） */
  fid: number;
  /** 创建用户 mid */
  mid: number;
  /** 收藏夹属性
   * 0: 私有收藏夹 0：公开 1：私有
   * 1：是否为默认收藏夹 0：默认收藏夹 1：其他收藏夹
   */
  attr: number;
  /** 收藏夹标题 */
  title: string;
  /** 收藏夹封面图片 url */
  cover: string;
  /** 收藏夹创建用户信息 */
  upper: FavFolderCollectedUpper;
  /** 作用尚不明确，一般为 2 */
  cover_type: number;
  /** 作用尚不明确，空字符串 */
  intro: string;
  /** 创建时间 时间戳 */
  ctime: number;
  /** 审核时间 时间戳 */
  mtime: number;
  /** 0: 正常; 1: 收藏夹已失效 */
  state: number;
  /** 作用尚不明确（文档示例为 0） */
  fav_state: number;
  /** 收藏夹总计视频数 */
  media_count: number;
}

/**
 * 收藏夹创建用户信息
 */
export interface FavFolderCollectedUpper {
  /** 创建人 mid */
  mid: number;
  /** 创建人昵称 */
  name: string;
  /** 作用尚不明确，文档示例为空字符串 */
  face: string;
}

/**
 * 查询用户收藏的视频收藏夹
 * @param params 请求参数
 * @returns Promise<FavFolderCollectedListResponse>
 */
export const getFavFolderCollectedList = (params: FavFolderCollectedListRequestParams) => {
  return apiRequest.get<FavFolderCollectedListResponse>("/x/v3/fav/folder/collected/list", { params });
};
