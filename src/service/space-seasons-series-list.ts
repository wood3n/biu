import { apiRequest } from "./request";

/**
 * 查询指定用户合集 - 请求参数
 */
export interface SpaceSeasonsSeriesListRequestParams {
  /** 用户 mid */
  mid: number;
  /** 每页条数 */
  page_size: number;
  /** 页码 */
  page_num: number;
  /** 固定为 0.0 */
  web_location?: string;
}

/**
 * 查询指定用户合集 - data
 */
export interface SpaceSeasonsSeriesListResponse {
  /** 返回值 0：成功；-400：请求错误 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: SpaceSeasonsSeriesListData;
}

interface SpaceSeasonsSeriesListData {
  items_lists: Itemslists;
}

interface Itemslists {
  page: Page;
  seasons_list: SeasonListData[];
  series_list: SeriesListData[];
}

interface SeasonListData {
  archives: Archive[];
  meta: SeasonListMeta;
  recent_aids: number[];
}

interface SeriesListData {
  archives: Archive[];
  meta: SeriesListMeta;
  recent_aids: number[];
}

interface SeasonListMeta {
  category: number;
  cover: string;
  description: string;
  mid: number;
  name: string;
  ptime: number;
  season_id: number;
  total: number;
}

interface SeriesListMeta {
  category: number;
  cover: string;
  creator: string;
  ctime: number;
  description: string;
  keywords: string[];
  last_update_ts: number;
  mid: number;
  mtime: number;
  name: string;
  raw_keywords: string;
  series_id: number;
  state: number;
  total: number;
}

interface Archive {
  aid: number;
  bvid: string;
  ctime: number;
  duration: number;
  enable_vt: boolean;
  interactive_video: boolean;
  pic: string;
  playback_position: number;
  pubdate: number;
  stat: Stat;
  state: number;
  title: string;
  ugc_pay: number;
  vt_display: string;
  is_lesson_video: number;
}

interface Stat {
  view: number;
  vt: number;
}

interface Page {
  page_num: number;
  page_size: number;
  total: number;
}

/**
 * 查询指定用户合集
 */
export function getSpaceSeasonsSeriesList(params: SpaceSeasonsSeriesListRequestParams) {
  return apiRequest.get<SpaceSeasonsSeriesListResponse>("/x/polymer/web-space/seasons_series_list", { params });
}
