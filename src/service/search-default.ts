import request from "./request";

export interface StyleKeyword {
  keyWord?: string;
  descWord?: null;
}

export interface SearchDefaultDataType {
  showKeyword?: string;
  styleKeyword?: StyleKeyword;
  realkeyword?: string;
  searchType?: number;
  action?: number;
  alg?: string;
  gap?: number;
  source?: null;
  bizQueryInfo?: string;
  logInfo?: null;
  imageUrl?: null;
}

/*
 * 默认搜索关键词
 */
export const getSearchDefault = () => request.get<APIResponseNestData<SearchDefaultDataType>>("/search/default");
