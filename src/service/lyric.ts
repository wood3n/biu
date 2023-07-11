import request from './request';

export interface lyricRequestParams {
  id: number | undefined;
}

export interface GetLyricsRes {
  sgc: boolean;
  sfy: boolean;
  qfy: boolean;
  lrc: Klyric;
  klyric: Klyric;
  tlyric: Klyric;
  romalrc: Klyric;
  code: number;
}

export interface Klyric {
  version: number;
  lyric: string;
}

/*
 * 获取歌词
 */
export const getLyrics = (params: lyricRequestParams) => request.get<GetLyricsRes>('/lyric', { params });
