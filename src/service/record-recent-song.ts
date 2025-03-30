import request from "./request";

interface Params {
  limit: number;
}

export interface GetRecentSongResponse {
  code: number;
  data: GetRecentSongResponseData;
  message: string;
}

export interface GetRecentSongResponseData {
  total: number;
  list: List[];
}

export interface List {
  resourceId: string;
  playTime: number;
  resourceType: string;
  data: Song;
  banned: boolean;
  multiTerminalInfo: MultiTerminalInfo;
}

export interface MultiTerminalInfo {
  icon: string;
  os: OS;
  osText: OSText;
}

export enum OS {
  Iphone = "iphone",
  Osx = "osx",
  PC = "pc",
}

export enum OSText {
  未知 = "未知",
  移动端 = "移动端",
}

/*
 * 获取最近播放歌曲
 */
export const getRecentSongs = (params?: Params) => request.get<GetRecentSongResponse>("/record/recent/song", { params });
