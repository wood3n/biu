import request from './request';

export interface UserDetailRequestParams {
  uid: string | undefined;
}

export interface UserPoint {
  userId?: number;
  balance?: number;
  updateTime?: number;
  version?: number;
  status?: number;
  blockBalance?: number;
}

export interface PrivacyItemUnlimit {
  area?: boolean;
  college?: boolean;
  age?: boolean;
  villageAge?: boolean;
}

export interface UserDetailProfile {
  privacyItemUnlimit?: PrivacyItemUnlimit;
  avatarDetail?: null;
  avatarImgIdStr?: string;
  backgroundImgIdStr?: string;
  accountStatus?: number;
  mutual?: boolean;
  avatarUrl?: string;
  backgroundImgId?: number;
  backgroundUrl?: string;
  province?: number;
  city?: number;
  remarkName?: null;
  authStatus?: number;
  detailDescription?: string;
  experts?: Record<string, unknown>;
  expertTags?: null;
  birthday?: number;
  gender?: number;
  nickname?: string;
  description?: string;
  createTime?: number;
  userType?: number;
  userId?: number;
  vipType?: number;
  avatarImgId?: number;
  defaultAvatar?: boolean;
  djStatus?: number;
  followed?: boolean;
  signature?: string;
  authority?: number;
  followeds?: number;
  follows?: number;
  blacklist?: boolean;
  eventCount?: number;
  allSubscribedCount?: number;
  playlistBeSubscribedCount?: number;
  avatarImgId_str?: string;
  followTime?: null;
  followMe?: boolean;
  artistIdentity?: any[];
  cCount?: number;
  inBlacklist?: boolean;
  sDJPCount?: number;
  playlistCount?: number;
  sCount?: number;
  newFollows?: number;
}

export interface ProfileVillageInfo {
  title?: string;
  imageUrl?: string;
  targetUrl?: string;
}

export interface UserDetail {
  level?: number;
  listenSongs?: number;
  userPoint?: UserPoint;
  mobileSign?: boolean;
  pcSign?: boolean;
  profile?: UserDetailProfile;
  peopleCanSeeMyPlayRecord?: boolean;
  bindings?: any[];
  adValid?: boolean;
  code?: number;
  newUser?: boolean;
  recallUser?: boolean;
  createTime?: number;
  createDays?: number;
  profileVillageInfo?: ProfileVillageInfo;
}

/*
 * 获取用户详情
 */
export const getUserDetail = (params: UserDetailRequestParams) => request.get<UserDetail>('/user/detail', { params });
