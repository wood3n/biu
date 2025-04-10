import request from "./request";

export interface AlbumRequestParams {
  id: string | number | undefined;
}

export interface GetAlbumRes {
  resourceState?: boolean;
  songs?: Song[];
  album?: Album;
  code?: number;
}

export interface Album {
  songs?: any[];
  paid?: boolean;
  onSale?: boolean;
  mark?: number;
  awardTags?: null;
  companyId?: number;
  blurPicUrl?: string;
  pic?: number;
  alias?: any[];
  artists?: Artist[];
  copyrightId?: number;
  picId?: number;
  artist?: Artist;
  publishTime?: number;
  company?: string;
  briefDesc?: string;
  picUrl?: string;
  commentThreadId?: string;
  tags?: string;
  description?: string;
  status?: number;
  subType?: string;
  name?: string;
  id?: number;
  type?: string;
  size?: number;
  picId_str?: string;
  info?: Info;
}

export interface Artist {
  img1v1Id?: number;
  topicPerson?: number;
  followed?: boolean;
  trans?: string;
  alias?: any[];
  picId?: number;
  briefDesc?: string;
  musicSize?: number;
  albumSize?: number;
  picUrl?: string;
  img1v1Url?: string;
  name?: string;
  id?: number;
  picId_str?: string;
  img1v1Id_str?: string;
}

export interface Info {
  commentThread?: CommentThread;
  latestLikedUsers?: null;
  liked?: boolean;
  comments?: null;
  resourceType?: number;
  resourceId?: number;
  commentCount?: number;
  likedCount?: number;
  shareCount?: number;
  threadId?: string;
}

export interface CommentThread {
  id?: string;
  resourceInfo?: ResourceInfo;
  resourceType?: number;
  commentCount?: number;
  likedCount?: number;
  shareCount?: number;
  hotCount?: number;
  latestLikedUsers?: null;
  resourceOwnerId?: number;
  resourceTitle?: string;
  resourceId?: number;
}

export interface ResourceInfo {
  id?: number;
  userId?: number;
  name?: string;
  imgUrl?: string;
  creator?: null;
  encodedId?: null;
  subTitle?: null;
  webUrl?: null;
}

export interface Al {
  id?: number;
  name?: string;
  picUrl?: string;
  pic_str?: string;
  pic?: number;
}

export interface Ar {
  id?: number;
  name?: string;
}

export interface H {
  br?: number;
  fid?: number;
  size?: number;
  vd?: number;
  sr?: number;
}

export interface Privilege {
  id?: number;
  fee?: number;
  payed?: number;
  st?: number;
  pl?: number;
  dl?: number;
  sp?: number;
  cp?: number;
  subp?: number;
  cs?: boolean;
  maxbr?: number;
  fl?: number;
  toast?: boolean;
  flag?: number;
  preSell?: boolean;
  playMaxbr?: number;
  downloadMaxbr?: number;
  maxBrLevel?: string;
  playMaxBrLevel?: string;
  downloadMaxBrLevel?: string;
  plLevel?: string;
  dlLevel?: string;
  flLevel?: string;
  rscl?: null;
  freeTrialPrivilege?: FreeTrialPrivilege;
  chargeInfoList?: ChargeInfoList[];
}

export interface ChargeInfoList {
  rate?: number;
  chargeUrl?: null;
  chargeMessage?: null;
  chargeType?: number;
}

export interface FreeTrialPrivilege {
  resConsumable?: boolean;
  userConsumable?: boolean;
  listenType?: null;
}

/*
 * 获取专辑内容
 */
export const getAlbum = (params: AlbumRequestParams) => request.get<GetAlbumRes>("/album", { params });
