import request from "./request";

export interface UserAcountStats {
  programCount?: number;
  djRadioCount?: number;
  mvCount?: number;
  artistCount?: number;
  newProgramCount?: number;
  createDjRadioCount?: number;
  createdPlaylistCount?: number;
  subPlaylistCount?: number;
  code?: number;
}

/*
 * 获取用户信息，歌单，收藏，mv，dj 数量
 */
export const getUserSubcount = () => request.get<UserAcountStats>("/user/subcount");
