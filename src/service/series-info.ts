import { apiRequest } from "./request";

export interface SeriesInfoRequestParams {
  series_id: number;
}

export interface SeriesInfoResponse {
  code: number;
  message: string;
  ttl: number;
  data: SeriesInfoData;
}

export interface SeriesInfoData {
  meta: SeriesMeta;
  recent_aids: number[];
}

export interface SeriesMeta {
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

export function getSeriesInfo(params: SeriesInfoRequestParams) {
  return apiRequest.get<SeriesInfoResponse>("/x/series/series", { params });
}
