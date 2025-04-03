import request from "./request";

export interface GetArtistSublistRequestParams {
  limit: number | undefined;
  offset: number | undefined;
}

export interface GetArtistSublist {
  code?: number;
  count?: number;
  hasMore?: boolean;
  data?: ArtistSublistData[];
}

export interface Artist {
  img1v1Id?: number;
  topicPerson?: number;
  followed?: boolean;
  alias?: any[];
  picId?: number;
  picUrl?: string;
  briefDesc?: string;
  musicSize?: number;
  albumSize?: number;
  img1v1Url?: string;
  trans?: string;
  name?: string;
  id?: number;
  img1v1Id_str?: string;
}

export interface ArtistSublistData {
  info?: string;
  id?: number;
  name?: string;
  trans?: null;
  alias?: string[];
  albumSize?: number;
  mvSize?: number;
  picId?: number;
  picUrl?: string;
  img1v1Url?: string;
  artists?: Artist[];
}

/*
 * 收藏的歌手列表
 */
export const getArtistSublist = (params: GetArtistSublistRequestParams) =>
  request.get<GetArtistSublist>("/artist/sublist", { params });
