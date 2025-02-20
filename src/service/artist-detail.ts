import request from "./request";

export interface ArtistDetailRequestParams {
  id: string | undefined;
}

export interface GetArtistDetailRes {
  message?: string;
  data?: Data;
  code?: number;
}

export interface Data {
  videoCount?: number;
  vipRights?: VipRights;
  identify?: Identify;
  artist?: Artist;
  blacklist?: boolean;
  preferShow?: number;
  showPriMsg?: boolean;
  secondaryExpertIdentiy?: SecondaryExpertIdentiy[];
  eventCount?: number;
  user?: User;
}

export interface Artist {
  id?: number;
  cover?: string;
  name?: string;
  transNames?: any[];
  alias?: any[];
  identities?: string[];
  identifyTag?: string[];
  briefDesc?: string;
  rank?: null;
  albumSize?: number;
  musicSize?: number;
  mvSize?: number;
}

export interface Identify {
  imageUrl?: string;
  imageDesc?: string;
  actionUrl?: string;
}

export interface SecondaryExpertIdentiy {
  expertIdentiyId?: number;
  expertIdentiyName?: string;
  expertIdentiyCount?: number;
}

export interface User {
  backgroundUrl?: string;
  birthday?: number;
  detailDescription?: string;
  authenticated?: boolean;
  gender?: number;
  city?: number;
  signature?: string;
  description?: string;
  remarkName?: null;
  shortUserName?: string;
  accountStatus?: number;
  locationStatus?: number;
  avatarImgId?: number;
  defaultAvatar?: boolean;
  province?: number;
  nickname?: string;
  expertTags?: null;
  djStatus?: number;
  avatarUrl?: string;
  accountType?: number;
  authStatus?: number;
  vipType?: number;
  userName?: string;
  followed?: boolean;
  userId?: number;
  lastLoginIP?: string;
  lastLoginTime?: number;
  authenticationTypes?: number;
  mutual?: boolean;
  createTime?: number;
  anchor?: boolean;
  authority?: number;
  backgroundImgId?: number;
  userType?: number;
  experts?: null;
  avatarDetail?: AvatarDetail;
}

export interface AvatarDetail {
  userType?: number;
  identityLevel?: number;
  identityIconUrl?: string;
}

export interface VipRights {
  rightsInfoDetailDtoList?: RightsInfoDetailDtoList[];
  oldProtocol?: boolean;
  redVipAnnualCount?: number;
  redVipLevel?: number;
  now?: number;
}

export interface RightsInfoDetailDtoList {
  vipCode?: number;
  expireTime?: number;
  iconUrl?: null;
  dynamicIconUrl?: null;
  vipLevel?: number;
  signIap?: boolean;
  signDeduct?: boolean;
  signIapDeduct?: boolean;
  sign?: boolean;
}

/*
 * 获取歌手详情
 */
export const getArtistDetail = (params: ArtistDetailRequestParams) => request.get<GetArtistDetailRes>("/artist/detail", { params });
