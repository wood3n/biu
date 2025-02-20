import request from "./request";

export interface UserFollowsRequestParams {
  uid: number | undefined;
  limit: number | undefined;
  offset: number | undefined;
}

export interface AvatarDetail {
  userType?: number;
  identityLevel?: number;
  identityIconUrl?: string;
}

export interface Associator {
  vipCode?: number;
  rights?: boolean;
}

export interface VipRights {
  associator?: Associator;
  musicPackage?: Associator;
  redVipAnnualCount?: number;
  redVipLevel?: number;
}

export interface Follow {
  py?: string;
  time?: number;
  accountStatus?: number;
  avatarDetail?: AvatarDetail;
  userType?: number;
  followed?: boolean;
  vipType?: number;
  follows?: number;
  remarkName?: null;
  mutual?: boolean;
  nickname?: string;
  followeds?: number;
  avatarUrl?: string;
  authStatus?: number;
  gender?: number;
  expertTags?: null;
  experts?: null;
  userId?: number;
  signature?: string;
  vipRights?: VipRights;
  blacklist?: boolean;
  eventCount?: number;
  playlistCount?: number;
}

export interface UserFollows {
  touchCount?: number;
  more?: boolean;
  follow?: Follow[];
}

/*
 * 获取用户关注列表
 */
export const getUserFollows = (params: UserFollowsRequestParams) => request.get<APIResponse<UserFollows>>("/user/follows", { params });
