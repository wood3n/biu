import type { Rights, Owner, Stat, Dimension } from "./web-interface-view";

import { apiRequest } from "./request";

/**
 * 查询用户置顶视频
 */
export interface SpaceTopArcRequestParams {
  /** 目标用户 mid */
  vmid: number;
}

export interface SpaceTopArcData {
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

export interface SpaceTopArcResponse {
  code: number;
  message: string;
  ttl: number;
  data: SpaceTopArcData | null;
}

export const getSpaceTopArc = (params: SpaceTopArcRequestParams): Promise<SpaceTopArcResponse> => {
  return apiRequest.get<SpaceTopArcResponse>("/x/space/top/arc", {
    params,
  });
};

/**
 * 设置置顶视频
 * avid 与 bvid 二选一，reason 可选
 */
export interface SpaceTopArcSetBody {
  aid?: number;
  bvid?: string;
  reason?: string;
}

export interface SpaceTopArcSetResponse {
  code: number;
  message: string;
  ttl: number;
}

export const setSpaceTopArc = (data: SpaceTopArcSetBody): Promise<SpaceTopArcSetResponse> => {
  return apiRequest.post<SpaceTopArcSetResponse>("/x/space/top/arc/set", data, {
    useFormData: true,
    useCSRF: true,
  });
};

/**
 * 取消置顶视频
 */
export interface SpaceTopArcCancelResponse {
  code: number;
  message: string;
  ttl: number;
}

export const cancelSpaceTopArc = (): Promise<SpaceTopArcCancelResponse> => {
  return apiRequest.post<SpaceTopArcCancelResponse>(
    "/x/space/top/arc/cancel",
    {},
    {
      useFormData: true,
      useCSRF: true,
    },
  );
};
