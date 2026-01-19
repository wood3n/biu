import { apiRequest } from "./request";

/**
 * 稿件关系信息(web端) - 请求参数
 * GET /x/web-interface/archive/relation
 */
export interface WebInterfaceArchiveRelationRequestParams {
  /** 稿件 avid，可选（与 bvid 至少传一个） */
  aid?: number;
  /** 稿件 bvid，可选（与 aid 至少传一个） */
  bvid?: string;
}

/**
 * 稿件关系信息(web端) - data
 */
export interface WebInterfaceArchiveRelationData {
  /** 是否已关注稿件 UP 主 */
  attention: boolean;
  /** 是否已收藏稿件 */
  favorite: boolean;
  /** 是否已收藏到合集/追番等 */
  season_fav: boolean;
  /** 是否已点赞 */
  like: boolean;
  /** 是否已点踩 */
  dislike: boolean;
  /** 投币数量 */
  coin: number;
}

/**
 * 稿件关系信息(web端) - 顶层响应
 */
export interface WebInterfaceArchiveRelationResponse {
  /** 返回值：0 成功；-400 请求错误 等 */
  code: number;
  /** 错误信息，成功时一般为 "OK" 或 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: WebInterfaceArchiveRelationData;
}

/**
 * 获取稿件关系信息(web端)
 */
export function getWebInterfaceArchiveRelation(
  params: WebInterfaceArchiveRelationRequestParams,
): Promise<WebInterfaceArchiveRelationResponse> {
  return apiRequest.get<WebInterfaceArchiveRelationResponse>("/x/web-interface/archive/relation", {
    params,
  });
}

/**
 * 一键三连视频(web端) - 请求参数
 * POST /x/web-interface/archive/like/triple
 */
export interface WebInterfaceArchiveLikeTripleRequestParams {
  /** 稿件 avid，可选（与 bvid 至少传一个） */
  aid?: number;
  /** 稿件 bvid，可选（与 aid 至少传一个） */
  bvid?: string;
}

/**
 * 一键三连视频(web端) - data
 */
export interface WebInterfaceArchiveLikeTripleData {
  /** 是否点赞成功 */
  like: boolean;
  /** 是否投币成功 */
  coin: boolean;
  /** 是否收藏成功 */
  fav: boolean;
  /** 投币枚数，默认为 2 */
  multiply: number;
}

/**
 * 一键三连视频(web端) - 顶层响应
 */
export interface WebInterfaceArchiveLikeTripleResponse {
  /** 返回值：0 成功；-101 未登录；-111 csrf 校验失败；-400 请求错误；10003 稿件不存在；-403 账号异常 */
  code: number;
  /** 错误信息，成功时一般为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: WebInterfaceArchiveLikeTripleData;
}
