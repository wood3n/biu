import request from "./request";

export interface ArtistDescRequestParams {
  id: string | undefined;
}

export interface ArtistDescResponse {
  introduction: Introduction[];
  briefDesc: string;
  count: number;
  topicData: TopicDatum[];
  code: number;
}

export interface Introduction {
  ti: string;
  txt: string;
}

export interface TopicDatum {
  topic: Topic;
  creator: Creator;
  shareCount: number;
  commentCount: number;
  likedCount: number;
  liked: boolean;
  rewardCount: number;
  rewardMoney: number;
  relatedResource: null;
  rectanglePicUrl: string;
  coverUrl: string;
  categoryId: number;
  categoryName: string;
  mainTitle: string;
  commentThreadId: string;
  reward: boolean;
  shareContent: string;
  wxTitle: string;
  addTime: number;
  seriesId: number;
  showComment: boolean;
  showRelated: boolean;
  memo: null;
  summary: string;
  recmdTitle: string;
  recmdContent: string;
  readCount: number;
  url: string;
  title: string;
  tags: string[];
  id: number;
  number: number;
}

export interface Creator {
  userId: number;
  userType: number;
  nickname: string;
  avatarImgId: number;
  avatarUrl: string;
  backgroundImgId: number;
  backgroundUrl: string;
  signature: string;
  createTime: number;
  userName: string;
  accountType: number;
  shortUserName: string;
  birthday: number;
  authority: number;
  gender: number;
  accountStatus: number;
  province: number;
  city: number;
  authStatus: number;
  description: null;
  detailDescription: null;
  defaultAvatar: boolean;
  expertTags: string[] | null;
  experts: Experts | null;
  djStatus: number;
  locationStatus: number;
  vipType: number;
  followed: boolean;
  mutual: boolean;
  authenticated: boolean;
  lastLoginTime: number;
  lastLoginIP: string;
  remarkName: null;
  viptypeVersion: number;
  authenticationTypes: number;
  avatarDetail: null;
  anchor: boolean;
}

export interface Experts {
  "1": string;
}

export interface Topic {
  id: number;
  addTime: number;
  mainTitle: string;
  title: string;
  content: Content[];
  userId: number;
  cover: number;
  headPic: number;
  shareContent: string;
  wxTitle: string;
  showComment: boolean;
  status: number;
  seriesId: number;
  pubTime: number;
  readCount: number;
  tags: string[];
  pubImmidiatly: boolean;
  auditor: string;
  auditTime: number;
  auditStatus: number;
  startText: string;
  delReason: string;
  showRelated: boolean;
  fromBackend: boolean;
  rectanglePic: number;
  updateTime: number;
  reward: boolean;
  summary: string;
  memo: null;
  adInfo: string;
  categoryId: number;
  hotScore: number;
  recomdTitle: string;
  recomdContent: string;
  number: number;
}

export interface Content {
  type: number;
  id: number;
  content: null | string;
}

/*
 * 获取歌手描述（deprecated）
 */
export const getArtistDesc = (params: ArtistDescRequestParams) =>
  request.get<ArtistDescResponse>("/artist/desc", { params });
