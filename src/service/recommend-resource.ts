import request from './request';

export interface RecommendResourceData {
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
  mutual?: boolean;
  remarkName?: null;
  avatarImgId?: number;
  backgroundImgId?: number;
  avatarImgIdStr?: string;
  backgroundUrl?: string;
  djStatus?: number;
  followed?: boolean;
  detailDescription?: string;
  defaultAvatar?: boolean;
  expertTags?: null;
  gender?: number;
  avatarUrl?: string;
  authStatus?: number;
  userType?: number;
  nickname?: string;
  accountStatus?: number;
  vipType?: number;
  province?: number;
  birthday?: number;
  city?: number;
  backgroundImgIdStr?: string;
  userId?: number;
  description?: string;
  signature?: string;
  authority?: number;
}

/*
 * 获取每日推荐歌单
 */
export const getRecommendResource = () => request.get<RecommendResourceData>('/recommend/resource');
