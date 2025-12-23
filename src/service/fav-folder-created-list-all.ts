import { apiRequest } from "./request";

/**
 * 获取指定用户创建的所有收藏夹信息 - 请求参数
 * 请求方式：GET
 * 认证方式：Cookie(SESSDATA) 或 APP
 */
export interface FavFolderCreatedListAllRequestParams {
  /** 目标用户 mid */
  up_mid: number;
  /** 目标内容属性，默认为全部
   * 0：全部
   * 2：视频稿件
   */
  type?: number;
  /** 目标内容 id（视频稿件：avid） */
  rid?: string | number;
  /** web 位置标识，如 333.1387 */
  web_location?: string;
}

/**
 * 获取指定用户创建的所有收藏夹信息 - 响应对象
 */
export interface FavFolderCreatedListAllResponse {
  /** 返回值 0：成功 -400：请求错误 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，目标用户未公开时为 null，公开时为对象 */
  data: FavFolderCreatedListAllData | null;
}

/**
 * 获取指定用户创建的所有收藏夹信息 - data
 */
export interface FavFolderCreatedListAllData {
  /** 创建的收藏夹数 */
  count: number;
  /** 收藏夹列表，没有收藏夹时为 null */
  list: FavFolderItem[] | null;
  /** 文档标注为 null（占位字段） */
  season: null;
}

/**
 * 收藏夹条目
 */
export interface FavFolderItem {
  /** 收藏夹 mlid（完整 id），由原始 id + 创建者 mid 尾号 2 位组成 */
  id: number;
  /** 收藏夹原始 id */
  fid: number;
  /** 创建者 mid */
  mid: number;
  /** 收藏夹属性二进制位
   * 位0：私有收藏夹（0：公开 1：私有）
   * 位1：是否为默认收藏夹（0：默认收藏夹 1：其他收藏夹）
   */
  attr: number;
  /** 收藏夹标题 */
  title: string;
  /** 目标 id 是否存在于该收藏夹（存在：1，不存在：0） */
  fav_state: number;
  /** 收藏夹内容数量 */
  media_count: number;
}

/**
 * 获取指定用户创建的所有收藏夹信息,以及指定视频是否存在于收藏夹中
 * @param params 请求参数
 * @returns Promise<FavFolderCreatedListAllResponse>
 */
export const getFavFolderCreatedListAll = (params: FavFolderCreatedListAllRequestParams) => {
  return apiRequest.get<FavFolderCreatedListAllResponse>("/x/v3/fav/folder/created/list-all", { params });
};
