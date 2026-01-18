import { apiRequest } from "./request";

export interface SeriesArchivesRequestParams {
  mid: number;
  series_id: number;
  only_normal?: boolean;
  sort?: "desc" | "asc";
  pn?: number;
  ps?: number;
  current_mid?: number;
}

export interface SeriesArchivesResponse {
  code: number;
  message: string;
  ttl: number;
  data: SeriesArchivesData;
}

export interface SeriesArchivesData {
  aids: number[];
  page: SeriesArchivesPage;
  archives: SeriesArchive[];
}

export interface SeriesArchivesPage {
  num: number;
  size: number;
  total: number;
}

export interface SeriesArchive {
  aid: number;
  bvid: string;
  ctime: number;
  duration: number;
  enable_vt: boolean;
  interactive_video: boolean;
  pic: string;
  playback_position: number;
  pubdate: number;
  stat: SeriesStat;
  state: number;
  title: string;
  ugc_pay: number;
  vt_display: string;
  is_lesson_video?: number;
}

export interface SeriesStat {
  view: number;
  vt: number;
}

export function getSeriesArchives(params: SeriesArchivesRequestParams) {
  return apiRequest.get<SeriesArchivesResponse>("/x/series/archives", { params });
}
