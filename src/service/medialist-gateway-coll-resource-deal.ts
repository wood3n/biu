import { apiRequest } from "./request";

interface CollResourceDealParams {
  /** 音乐 id */
  rid: string | number;
  /** 12 表示音频 */
  type: number | string;
  /** 添加目标收藏夹id，逗号分隔 */
  add_media_ids?: string;
  /** 从目标收藏夹id移除，逗号分隔 */
  del_media_ids?: string;
}

export interface CollResourceDealResponse {
  code: number;
  data: {
    prompt?: boolean;
  };
  message: string;
}

/**
 * 修改B站音乐的收藏夹
 */
export const postCollResourceDeal = (data: CollResourceDealParams) => {
  return apiRequest.post<CollResourceDealResponse>("/medialist/gateway/coll/resource/deal", data, {
    useFormData: true,
  });
};
