import type { Rights, Owner, Stat, Dimension } from "./web-interface-view";

import { apiRequest } from "./request";

/**
 * 查询用户代表作视频列表
 */
export interface SpaceMasterpieceRequestParams {
  /** 目标用户 mid */
  vmid: number;
}

export interface SpaceMasterpieceItem {
  aid: number;
  videos: number;
  tid: number;
  tname: string;
  copyright: number;
  pic: string;
  title: string;
  pubdate: number;
  ctime: number;
  desc: string;
  state: number;
  attribute: number;
  duration: number;
  rights: Rights;
  owner: Owner;
  stat: Stat;
  dynamic: string;
  cid: number;
  dimension: Dimension;
  bvid: string;
  reason: string;
  inter_video: boolean;
}

export interface SpaceMasterpieceResponse {
  code: number;
  message: string;
  ttl: number;
  data: SpaceMasterpieceItem[];
}

export const getSpaceMasterpiece = (params: SpaceMasterpieceRequestParams): Promise<SpaceMasterpieceResponse> => {
  return apiRequest.get<SpaceMasterpieceResponse>("/x/space/masterpiece", {
    params,
  });
};

/**
 * 添加代表作视频
 * 起始作者说明：接口文档指明返回的 data 对象与置顶视频相同
 */
export interface SpaceMasterpieceAddBody {
  aid?: number;
  bvid?: string;
}

export interface SpaceMasterpieceAddResponse {
  code: number;
  message: string;
  ttl: number;
  data: SpaceMasterpieceItem;
}

export const addSpaceMasterpiece = (data: SpaceMasterpieceAddBody): Promise<SpaceMasterpieceAddResponse> => {
  return apiRequest.post<SpaceMasterpieceAddResponse>("/x/space/masterpiece/add", data, {
    useFormData: true,
    useCSRF: true,
  });
};

/**
 * 删除代表作视频
 */
export interface SpaceMasterpieceCancelBody {
  aid?: number;
  bvid?: string;
}

export interface SpaceMasterpieceCancelResponse {
  code: number;
  message: string;
  ttl: number;
}

export const cancelSpaceMasterpiece = (data: SpaceMasterpieceCancelBody): Promise<SpaceMasterpieceCancelResponse> => {
  return apiRequest.post<SpaceMasterpieceCancelResponse>("/x/space/masterpiece/cancel", data, {
    useFormData: true,
    useCSRF: true,
  });
};
