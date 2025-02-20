import request from "./request";

export interface SearchSuggestRequestParams {
  keywords: string | undefined;
  type: string | undefined;
}

export interface Artist {
  name?: string;
  id?: number;
  picId?: number;
  img1v1Id?: number;
  briefDesc?: string;
  picUrl?: string;
  img1v1Url?: string;
  albumSize?: number;
  alias?: any[];
  trans?: string;
  musicSize?: number;
  topicPerson?: number;
}

export interface SearchArtist {
  id?: number;
  name?: string;
  picUrl?: null | string;
  alias?: string[];
  albumSize?: number;
  picId?: number;
  fansGroup?: null;
  img1v1Url?: string;
  img1v1?: number;
  alia?: string[];
  trans?: null;
  accountId?: number;
}

export interface SearchAlbumElement {
  id?: number;
  name?: string;
  artist?: Artist;
  publishTime?: number;
  size?: number;
  copyrightId?: number;
  status?: number;
  picId?: number;
  mark?: number;
}

export interface SongAlbum {
  id?: number;
  name?: string;
  artist?: Artist;
  publishTime?: number;
  size?: number;
  copyrightId?: number;
  status?: number;
  picId?: number;
  mark?: number;
  alia?: string[];
}

export interface SearchSong {
  id?: number;
  name?: string;
  artists?: Artist[];
  album?: SongAlbum;
  duration?: number;
  copyrightId?: number;
  status?: number;
  alias?: string[];
  rtype?: number;
  ftype?: number;
  mvid?: number;
  fee?: number;
  rUrl?: null;
  mark?: number;
}

export interface SearchPlayList {
  id?: number;
  name?: string;
  coverImgUrl?: string;
  creator?: null;
  subscribed?: boolean;
  trackCount?: number;
  userId?: number;
  playCount?: number;
  bookCount?: number;
  specialType?: number;
  officialTags?: null;
  action?: null;
  actionType?: null;
  recommendText?: null;
  score?: null;
  description?: string;
  highQuality?: boolean;
}

export interface SearchSuggestion {
  albums?: SearchAlbumElement[];
  artists?: SearchArtist[];
  songs?: SearchSong[];
  playlists?: SearchPlayList[];
  order?: string[];
}

export interface SearchSuggestionRes {
  result: SearchSuggestion;
}

/*
 * 传入搜索关键词可获得搜索建议 , 搜索结果同时包含单曲 , 歌手 , 歌单信息
 */
export const getSearchSuggest = (params: SearchSuggestRequestParams) => request.get<APIResponse<SearchSuggestionRes>>("/search/suggest", { params });
