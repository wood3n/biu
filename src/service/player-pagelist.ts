import { apiRequest } from "./request";

/**
 * 查询视频分P列表 - 请求参数
 */
export interface PlayerPagelistRequestParams {
  aid?: number; // 稿件avid
  bvid?: string; // 稿件bvid
}

/**
 * 查询视频分P列表 - 响应类型
 */
export interface PlayerPagelistResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -404:无视频
  message: string; // 错误信息
  ttl: number; // 1
  data: PlayerPagelistItem[];
}

/**
 * 查询视频分P列表 - 分P条目
 */
export interface PlayerPagelistItem {
  cid: number; // 当前分P cid
  page: number; // 当前分P
  from: string; // 视频来源 vupload:普通上传(B站) hunan:芒果TV qq:腾讯
  part: string; // 当前分P标题
  duration: number; // 当前分P持续时间 单位为秒
  vid: string; // 站外视频vid
  weblink: string; // 站外视频跳转url
  dimension: PlayerPagelistDimension; // 当前分P分辨率
  first_frame: string; // 分P封面
}

/**
 * 查询视频分P列表 - 分辨率信息
 */
export interface PlayerPagelistDimension {
  width: number; // 当前分P 宽度
  height: number; // 当前分P 高度
  rotate: number; // 是否将宽高对换 0:正常 1:对换
}

/**
 * 查询视频分P列表
 * @param params 请求参数
 * @returns Promise<PlayerPagelistResponse>
 */
export const getPlayerPagelist = (params: PlayerPagelistRequestParams) => {
  return apiRequest.get<PlayerPagelistResponse>("/x/player/pagelist", { params });
};
