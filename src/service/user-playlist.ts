import request from "./request";

export interface UserPlaylistRequestParams {
  uid: number | string | undefined;
  limit: number | undefined;
  offset: number | undefined;
}

export interface Creator {
  defaultAvatar?: boolean;
  province?: number;
  authStatus?: number;
  followed?: boolean;
  avatarUrl?: string;
  accountStatus?: number;
  gender?: number;
  city?: number;
  birthday?: number;
  userId?: number;
  userType?: number;
  nickname?: string;
  signature?: string;
  description?: string;
  detailDescription?: string;
  avatarImgId?: number;
  backgroundImgId?: number;
  backgroundUrl?: string;
  authority?: number;
  mutual?: boolean;
  expertTags?: null;
  experts?: null;
  djStatus?: number;
  vipType?: number;
  remarkName?: null;
  authenticationTypes?: number;
  avatarDetail?: null;
  anchor?: boolean;
  avatarImgIdStr?: string;
  backgroundImgIdStr?: string;
  avatarImgId_str?: string;
}

export interface RecommendInfo {
  alg?: string;
  logInfo?: string;
}

export interface PlaylistInfoType {
  subscribers?: any[];
  /** 是否收藏 */
  subscribed?: boolean;
  creator?: Creator;
  artists?: null;
  tracks?: null;
  updateFrequency?: null | string;
  backgroundCoverId?: number;
  backgroundCoverUrl?: null | string;
  titleImage?: number;
  titleImageUrl?: null | string;
  englishTitle?: null | string;
  opRecommend?: boolean;
  recommendInfo?: RecommendInfo | null;
  subscribedCount?: number;
  cloudTrackCount?: number;
  /** 创建人 */
  userId?: number;
  totalDuration?: number;
  coverImgId?: number;
  privacy?: number;
  trackUpdateTime?: number;
  trackCount?: number;
  updateTime?: number;
  commentThreadId?: string;
  coverImgUrl?: string;
  specialType?: number;
  anonimous?: boolean;
  createTime?: number;
  highQuality?: boolean;
  newImported?: boolean;
  trackNumberUpdateTime?: number;
  playCount?: number;
  adType?: number;
  description?: null | string;
  tags?: string[];
  ordered?: boolean;
  status?: number;
  name: string;
  id: number;
  coverImgId_str?: null | string;
  sharedUsers?: null;
  shareStatus?: null;
  copied?: boolean;
}

export interface PersonalPlayList {
  version?: string;
  more?: boolean;
  playlist?: PlaylistInfoType[];
  code?: number;
}

/*
 * 获取用户歌单，包括喜欢的音乐列表，创建的歌单，收藏的歌单
 */
export const getUserPlaylist = (params: UserPlaylistRequestParams) =>
  request.get<PersonalPlayList>("/user/playlist", { params });
