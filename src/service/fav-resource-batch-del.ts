import { apiRequest } from "./request";

/**
 * 批量删除内容 - 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded）
 * 认证方式：Cookie（需要 csrf）或 APP
 */
export interface FavResourceBatchDelRequestParams {
  /** 目标内容 id 列表，格式：{内容id}:{内容类型}，多个用`,`分隔
   * 类型：2：视频稿件 12：音频 21：视频合集
   * 内容 id：视频稿件 avid / 音频 auid / 视频合集 id
   * 例："21822819:2,21918689:2,22288065:2"
   */
  resources: string;
  /** 目标收藏夹 id */
  media_id: string | number;
  /** 平台标识，可为 web */
  platform?: string;
}

/**
 * 批量删除内容 - 响应类型
 */
export interface FavResourceBatchDelResponse {
  /** 返回值 0：成功 -101：未登录 -111：csrf校验失败 -400：请求错误 11010：内容不存在 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体，成功为 0 */
  data: number;
}

/**
 * 批量删除内容
 */
export function postFavResourceBatchDel(data: FavResourceBatchDelRequestParams): Promise<FavResourceBatchDelResponse> {
  return apiRequest.post<FavResourceBatchDelResponse>("/x/v3/fav/resource/batch-del", data, {
    useCSRF: true,
    useFormData: true,
  });
}
