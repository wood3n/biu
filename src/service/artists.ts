import request from "./request";

export interface ArtistsRequestParams {
  id: string | undefined;
}

export interface ArtistsResponse {
  artist: Artist;
  hotSongs: Song[];
  more: boolean;
  code: number;
}

export interface Artist {
  img1v1Id: number;
  topicPerson: number;
  picId: number;
  musicSize: number;
  albumSize: number;
  briefDesc: string;
  picUrl: string;
  img1v1Url: string;
  /** 是否收藏 */
  followed: boolean;
  trans: string;
  alias: string[];
  name: string;
  id: number;
  publishTime: number;
  picId_str: string;
  img1v1Id_str: string;
  mvSize: number;
}

/*
 * 获得歌手部分信息和热门歌曲
 */
export const getArtists = (params: ArtistsRequestParams) => request.get<ArtistsResponse>("/artists", { params });
