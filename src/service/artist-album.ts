import request from "./request";

export interface ArtistAlbumRequestParams {
  id: string | undefined;
  limit: number | undefined;
  offset: number | undefined;
}

export interface ArtistAlbumResponse {
  code: number;
  more: boolean;
  artist: Artist;
  hotAlbums: HotAlbum[];
}

export interface Artist {
  img1v1Id: number;
  topicPerson: number;
  musicSize: number;
  albumSize: number;
  briefDesc: string;
  img1v1Url: string;
  picUrl: string;
  picId: number;
  followed: boolean;
  trans: string;
  alias: string[];
  name: string;
  id: number;
  picId_str: string;
  img1v1Id_str: string;
}

export interface HotAlbum {
  songs: any[];
  paid: boolean;
  onSale: boolean;
  mark: number;
  awardTags: null;
  displayTags: null;
  publishTime: number;
  company: string;
  briefDesc: string;
  commentThreadId: string;
  picUrl: string;
  artists: Artist[];
  copyrightId: number;
  picId: number;
  artist: Artist;
  blurPicUrl: string;
  companyId: number;
  pic: number;
  status: number;
  subType: string;
  alias: string[];
  description: string;
  tags: string;
  name: string;
  id: number;
  type: string;
  size: number;
  picId_str: string;
  isSub: boolean;
}

/*
 * 获取歌手专辑
 */
export const getArtistAlbum = (params: ArtistAlbumRequestParams) =>
  request.get<ArtistAlbumResponse>("/artist/album", { params });
