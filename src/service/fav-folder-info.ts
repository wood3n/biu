import { apiRequest } from "./request";

/**
 * 获取收藏夹元数据 - 请求参数
 * 请求方式：GET
 * 认证方式：Cookie(SESSDATA) 或 APP
 * 备注：查询权限收藏夹时需要相应用户登录
 */
export interface FavFolderInfoRequestParams {
  /** 目标收藏夹 id（完整 id，mlid） */
  media_id: number;
}

/**
 * 获取收藏夹元数据 - 响应对象
 */
export interface FavFolderInfoResponse {
  /** 返回值 0：成功 -400：请求错误 -403：访问权限不足 11010: 内容不存在 */
  code: number;
  /** 错误信息，默认 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，成功时为对象，失败时为 null */
  data: FavFolderInfoData | null;
}

/**
 * 收藏夹元数据 - data
 */
export interface FavFolderInfoData {
  /** 收藏夹 mlid（完整 id）= 原始 id + 创建者 mid 尾号 2 位 */
  id: number;
  /** 收藏夹原始 id */
  fid: number;
  /** 创建者 mid */
  mid: number;
  /** 二进制位属性, 0：公开, 1：私密 */
  attr: number;
  /** 收藏夹标题 */
  title: string;
  /** 收藏夹封面图片 url */
  cover: string;
  /** 创建者信息 */
  upper: FavFolderUpper;
  /** 封面图类别（？） */
  cover_type: number;
  /** 收藏夹状态数 */
  cnt_info: FavFolderCntInfo;
  /** 类型（一般是 11） */
  type: number;
  /** 备注 */
  intro: string;
  /** 创建时间 时间戳 */
  ctime: number;
  /** 收藏时间 时间戳 */
  mtime: number;
  /** 状态（一般为 0） */
  state: number;
  /** 收藏夹收藏状态 已收藏收藏夹：1 未收藏收藏夹：0（需要登录） */
  fav_state: number;
  /** 点赞状态 已点赞：1 未点赞：0（需要登录） */
  like_state: number;
  /** 收藏夹内容数量 */
  media_count: number;
}

/**
 * 创建者信息
 */
export interface FavFolderUpper {
  /** 创建者 mid */
  mid: number;
  /** 创建者昵称 */
  name: string;
  /** 创建者头像 url */
  face: string;
  /** 是否已关注创建者 */
  followed: boolean;
  /** 会员类别 0：无 1：月大会员 2：年度及以上大会员 */
  vip_type: number;
  /** 会员开通状态 0：无 1：有 */
  vip_statue: number;
}

/**
 * 收藏夹状态数
 */
export interface FavFolderCntInfo {
  /** 收藏数 */
  collect: number;
  /** 播放数 */
  play: number;
  /** 点赞数 */
  thumb_up: number;
  /** 分享数 */
  share: number;
}

/**
 * 获取收藏夹元数据
 * @param params 请求参数
 * @returns Promise<FavFolderInfoResponse>
 */
export const getFavFolderInfo = (params: FavFolderInfoRequestParams) => {
  return apiRequest.get<FavFolderInfoResponse>("/x/v3/fav/folder/info", { params });
};
