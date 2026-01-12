import got from "got";

export interface SearchSongByNeteaseParams {
  s: string;
  type: number;
  limit: number;
  offset: number;
}

export interface SearchSongByNeteaseResponse {
  result?: Result;
  code?: number;
  trp?: Trp;
}

export interface Result {
  songs?: Song[];
  hasMore?: boolean;
  songCount?: number;
}

export interface Song {
  /** 专辑信息 */
  album?: Album;
  fee?: number;
  /** 歌曲时长 */
  duration?: number;
  rtype?: number;
  ftype?: number;
  /** 歌手 */
  artists?: Artist[];
  copyrightId?: number;
  /** 翻译名称 */
  transNames?: string[];
  mvid?: number;
  name?: string;
  alias?: string[];
  id?: number;
  mark?: number;
  status?: number;
}

export interface Album {
  /** 发布时间 */
  publishTime?: number;
  size?: number;
  artist?: Artist;
  copyrightId?: number;
  /** 专辑名称 */
  name?: string;
  id?: number;
  picId?: number;
  /** 翻译名称 */
  alia?: string[];
  mark?: number;
  status?: number;
  transNames?: string[];
}

export interface Artist {
  img1v1Url?: string;
  musicSize?: number;
  albumSize?: number;
  img1v1?: number;
  /** 作者 */
  name?: string;
  alias?: any[];
  id?: number;
  picId?: number;
}

export interface Trp {
  rules?: string[];
}

export interface GetLyricsByNeteaseParams {
  id: number;
}

export interface GetLyricsByNeteaseResponse {
  sgc?: boolean;
  sfy?: boolean;
  qfy?: boolean;
  transUser?: User;
  lyricUser?: User;
  /** 原版歌词 */
  lrc?: Klyric;
  klyric?: Klyric;
  /** 翻译歌词 */
  tlyric?: Klyric;
  /** 歌词发音，一些非中文歌曲可能会返回 */
  romalrc?: Klyric;
  code?: number;
}

export interface Klyric {
  version?: number;
  lyric?: string;
}

export interface User {
  id?: number;
  status?: number;
  demand?: number;
  userid?: number;
  nickname?: string;
  uptime?: number;
}

export function getSongByNetease(params: SearchSongByNeteaseParams) {
  return got
    .get("https://interface.music.163.com/api/search/get", {
      searchParams: {
        ...params,
      },
    })
    .json<SearchSongByNeteaseResponse>();
}

export function getLyricsByNetease(params: GetLyricsByNeteaseParams) {
  return got
    .get("https://interface.music.163.com/api/song/lyric", {
      searchParams: {
        ...params,
        tv: -1,
        lv: -1,
        rv: -1,
        kv: -1,
        _nmclfl: 1,
      },
    })
    .json<GetLyricsByNeteaseResponse>();
}
