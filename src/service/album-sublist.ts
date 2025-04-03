import request from "./request";

export interface AlbumSublistRequestParams {
  limit: number | undefined;
  offset: number | undefined;
}

export interface GetAlbumSublist {
  code?: number;
  count?: number;
  hasMore?: boolean;
  paidCount?: number;
  data?: AlbumSublistData[];
}

export interface AlbumSublistData {
  subTime?: number;
  msg?: any[];
  alias?: any[];
  artists?: Artist[];
  picId?: number;
  picUrl?: string;
  name?: string;
  id?: number;
  size?: number;
  transNames?: any[];
}

export interface Artist {
  img1v1Id?: number;
  topicPerson?: number;
  alias?: any[];
  picId?: number;
  briefDesc?: string;
  musicSize?: number;
  albumSize?: number;
  picUrl?: string;
  img1v1Url?: string;
  followed?: boolean;
  trans?: string;
  name?: string;
  id?: number;
  img1v1Id_str?: string;
}

/*
 * 获取已收藏专辑列表
 */
export const getAlbumSublist = (params: AlbumSublistRequestParams) =>
  request.get<GetAlbumSublist>("/album/sublist", { params });
