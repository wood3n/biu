import type { FavFolderInfoData } from "./fav-folder-info";

import { apiRequest } from "./request";

/**
 * 修改收藏夹 - 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded）
 * 认证方式：Cookie（需要 csrf）或 APP
 */
export interface FavFolderEditRequestParams {
  /** 目标收藏夹 mdid（完整 mlid） */
  media_id: number;
  /** 修改后的收藏夹标题 */
  title: string;
  /** 修改后的收藏夹简介 */
  intro?: string;
  /** 是否公开 0：公开 1：私密，默认公开 */
  privacy?: 0 | 1;
  /** 封面图 url（会被审核） */
  cover?: string;
  /** CSRF Token（bili_jct），Cookie 方式必要 */
  csrf?: string;
}

/**
 * 修改收藏夹 - 响应类型
 * data 结构与获取收藏夹元数据的 data 一致
 */
export interface FavFolderEditResponse {
  /** 返回值 0：成功 -102：账号被封停 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: FavFolderInfoData;
}

/**
 * 修改收藏夹
 */
export function postFavFolderEdit(data: FavFolderEditRequestParams): Promise<FavFolderEditResponse> {
  return apiRequest.post<FavFolderEditResponse>("/x/v3/fav/folder/edit", data);
}
