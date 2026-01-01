import { apiRequest } from "./request";

interface Data {
  info: Info;
  medias: Media[];
}
export interface Media {
  id: number;
  title: string;
  cover: string;
  duration: number;
  pubtime: number;
  bvid: string;
  upper: Upper;
  cnt_info: Cntinfo;
  enable_vt: number;
  vt_display: string;
  is_self_view: boolean;
}
interface Info {
  id: number;
  season_type: number;
  title: string;
  cover: string;
  upper: Upper;
  cnt_info: Cntinfo;
  media_count: number;
  intro: string;
  enable_vt: number;
}
interface Cntinfo {
  collect: number;
  play: number;
  danmaku: number;
  vt: number;
}
interface Upper {
  mid: number;
  name: string;
}

/**
 * 获取视频合集(seasons_archives)信息 - 顶层响应
 */
export interface PolymerSeasonsArchivesListResponse {
  /** 返回值：0 成功；-352 请求被风控；-400 请求错误 */
  code: number;
  /** 错误信息（成功时一般为 "0"） */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: Data;
}

export interface PolymerSeasonsArchivesListRequestParams {
  season_id: number;
  pn?: number;
  ps?: number;
  /** 0.0 */
  web_location?: string;
}

/**
 * 获取视频合集详情以及合集的所有视频
 */
export function getUserVideoArchivesList(
  params: PolymerSeasonsArchivesListRequestParams,
): Promise<PolymerSeasonsArchivesListResponse> {
  return apiRequest.get<PolymerSeasonsArchivesListResponse>("/x/space/fav/season/list", {
    params,
    useWbi: true,
  });
}
