import request from './request';

export interface RecommendResource {
  code?: number;
  featureFirst?: boolean;
  haveRcmdSongs?: boolean;
  recommend?: Recommend[];
}

export interface Recommend {
  id?: number;
  type?: number;
  name?: string;
  copywriter?: string;
  picUrl?: string;
  playcount?: number;
  createTime?: number;
  creator?: Creator;
  trackCount?: number;
  userId?: number;
  alg?: string;
}

export interface Creator {
  avatarImgId?: number;
  backgroundImgId?: number;
  mutual?: boolean;
  remarkName?: null;
  backgroundImgIdStr?: string;
  detailDescription?: string;
  defaultAvatar?: boolean;
  expertTags?: null;
  djStatus?: number;
  avatarImgIdStr?: string;
  followed?: boolean;
  backgroundUrl?: string;
  accountStatus?: number;
  vipType?: number;
  province?: number;
  avatarUrl?: string;
  authStatus?: number;
  userType?: number;
  nickname?: string;
  gender?: number;
  birthday?: number;
  city?: number;
  userId?: number;
  description?: string;
  signature?: string;
  authority?: number;
}

/**
 * 获取每日推荐歌单
 */
export const getRecommendResource = () => request.get<RecommendResource>('/recommend/resource');