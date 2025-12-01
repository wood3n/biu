import type { FavFolderInfoData } from "./fav-folder-info";

import { apiRequest } from "./request";

/**
 * 新建收藏夹 - 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded）
 * 认证方式：Cookie（需要 csrf）或 APP
 */
export interface FavFolderAddRequestParams {
  /** 收藏夹标题 */
  title: string;
  /** 收藏夹简介，默认空 */
  intro?: string;
  /** 0：公开; 1：私密 */
  privacy?: 0 | 1;
  /** 封面图 url（会被审核） */
  cover?: string;
  /** CSRF Token（bili_jct），Cookie 方式必要 */
  csrf?: string;
}

/**
 * 新建收藏夹 - 响应类型
 * data 结构与获取收藏夹元数据的 data 一致
 */
export interface FavFolderAddResponse {
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
 * 新建收藏夹
 */
export function postFavFolderAdd(data: FavFolderAddRequestParams): Promise<FavFolderAddResponse> {
  return apiRequest.post<FavFolderAddResponse>("/x/v3/fav/folder/add", data, {
    useFormData: true,
    useCSRF: true,
  });
}
