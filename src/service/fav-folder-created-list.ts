import { apiRequest } from "./request";

/**
 * 获取指定用户创建的所有收藏夹信息 - 请求参数
 * 请求方式：GET
 * 认证方式：Cookie(SESSDATA) 或 APP
 */
export interface FavFolderCreatedListRequestParams {
  /** 目标用户 mid */
  up_mid: number;
  /** 每页数量，默认 20，最大 50 */
  ps?: number;
  /** 当前页码，默认 1 */
  pn?: number;
  /** web 位置标识，如 333.1387 */
  web_location?: string;
}

/**
 * 获取指定用户创建的所有收藏夹信息 - 响应对象
 */
export interface FavFolderCreatedListResponse {
  /** 返回值 0：成功 -400：请求错误 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，目标用户未公开时为 null，公开时为对象 */
  data: FavFolderCreatedListData | null;
}

interface FavFolderCreatedListData {
  count: number;
  list: List[];
  has_more: boolean;
}

interface List {
  id: number;
  fid: number;
  mid: number;
  attr: number;
  attr_desc: string;
  title: string;
  cover: string;
  upper: Upper;
  cover_type: number;
  intro: string;
  ctime: number;
  mtime: number;
  state: number;
  fav_state: number;
  media_count: number;
  view_count: number;
  vt: number;
  is_top: boolean;
  recent_fav?: any;
  play_switch: number;
  type: number;
  link: string;
  bvid: string;
}

interface Upper {
  mid: number;
  name: string;
  face: string;
  jump_link: string;
}

/**
 * 获取指定用户创建的所有收藏夹信息
 * @param params 请求参数
 * @returns Promise<FavFolderCreatedListAllResponse>
 */
export const getFavFolderCreatedList = (params: FavFolderCreatedListRequestParams) => {
  return apiRequest.get<FavFolderCreatedListResponse>("/x/v3/fav/folder/created/list", { params });
};
