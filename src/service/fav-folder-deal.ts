import { apiRequest } from "./request";

/**
 * 将视频添加到收藏夹 - 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded）
 * 认证方式：Cookie（需要 csrf）或 APP
 */
export interface FavFolderAddRequestParams {
  /** 视频id */
  rid: string;
  /** 添加目标收藏夹id，逗号分隔 */
  add_media_ids?: string;
  /** 从目标收藏夹id移除，逗号分隔 */
  del_media_ids?: string;
  /** 视频：2 */
  type: number;
  /** web */
  platform: string;
  /** 1 */
  ga: number;
  /** web_normal */
  gaia_source: string;
}

/**
 * 将视频添加到收藏夹 - 响应类型
 * data 结构与获取收藏夹元数据的 data 一致
 */
export interface FavFolderAddResponse {
  /** 返回值 0：成功 -102：账号被封停 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
}

/**
 * 将视频添加到收藏夹，或从收藏夹中移除
 */
export function postFavFolderDeal(data: FavFolderAddRequestParams): Promise<FavFolderAddResponse> {
  return apiRequest.post<FavFolderAddResponse>("/x/v3/fav/resource/deal", data, {
    useCSRF: true,
    useFormData: true,
  });
}
