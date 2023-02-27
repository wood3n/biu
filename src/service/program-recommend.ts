import request from './request';

export interface ProgramRecommend {
  code?: number;
  name?: string;
  programs?: Program[];
}

export interface Program {
  mainSong?: MainSong;
  songs?: null;
  dj?: Dj;
  blurCoverUrl?: string;
  radio?: Radio;
  duration?: number;
  authDTO?: null;
  buyed?: boolean;
  programDesc?: null;
  h5Links?: null;
  canReward?: boolean;
  auditStatus?: number;
  videoInfo?: null;
  score?: number;
  liveInfo?: null;
  alg?: string;
  disPlayStatus?: null;
  auditDisPlayStatus?: number;
  categoryName?: null;
  secondCategoryName?: null;
  existLyric?: boolean;
  djPlayRecordVo?: null;
  recommended?: boolean;
  icon?: null;
  adIconInfo?: null;
  isPublish?: boolean;
  titbitImages?: null;
  trackCount?: number;
  categoryId?: number;
  serialNum?: number;
  scheduledPublishTime?: number;
  coverId?: number;
  coverUrl?: string;
  bdAuditStatus?: number;
  secondCategoryId?: number;
  pubStatus?: number;
  smallLanguageAuditStatus?: number;
  createEventId?: number;
  listenerCount?: number;
  channels?: string[];
  mainTrackId?: number;
  programFeeType?: number;
  titbits?: null;
  feeScope?: number;
  reward?: boolean;
  subscribedCount?: number;
  privacy?: boolean;
  commentThreadId?: string;
  description?: string;
  createTime?: number;
  name?: string;
  id?: number;
  reason?: string;
  subscribed?: boolean;
  shareCount?: number;
  likedCount?: number;
  commentCount?: number;
}

export interface Dj {
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
  backgroundImgIdStr?: string;
  avatarImgIdStr?: string;
  anchor?: boolean;
  brand?: string;
}

export interface MainSong {
  name?: string;
  id?: number;
  position?: number;
  alias?: any[];
  status?: number;
  fee?: number;
  copyrightId?: number;
  disc?: string;
  no?: number;
  artists?: Artist[];
  album?: Album;
  starred?: boolean;
  popularity?: number;
  score?: number;
  starredNum?: number;
  duration?: number;
  playedNum?: number;
  dayPlays?: number;
  hearTime?: number;
  ringtone?: string;
  crbt?: null;
  audition?: null;
  copyFrom?: string;
  commentThreadId?: string;
  rtUrl?: null;
  ftype?: number;
  rtUrls?: any[];
  copyright?: number;
  transName?: null;
  sign?: null;
  mark?: number;
  noCopyrightRcmd?: null;
  rtype?: number;
  rurl?: null;
  mvid?: number;
  bMusic?: Music;
  mp3Url?: null;
  hMusic?: null;
  mMusic?: Music;
  lMusic?: Music;
}

export interface Album {
  name?: string;
  id?: number;
  type?: null;
  size?: number;
  picId?: number;
  blurPicUrl?: string;
  companyId?: number;
  pic?: number;
  picUrl?: string;
  publishTime?: number;
  description?: string;
  tags?: string;
  company?: null;
  briefDesc?: string;
  artist?: Artist;
  songs?: any[];
  alias?: any[];
  status?: number;
  copyrightId?: number;
  commentThreadId?: string;
  artists?: Artist[];
  subType?: null;
  transName?: null;
  mark?: number;
  picId_str?: string;
}

export interface Artist {
  name?: string;
  id?: number;
  picId?: number;
  img1v1Id?: number;
  briefDesc?: string;
  picUrl?: string;
  img1v1Url?: string;
  albumSize?: number;
  alias?: any[];
  trans?: string;
  musicSize?: number;
  topicPerson?: number;
}

export interface Music {
  name?: null;
  id?: number;
  size?: number;
  extension?: string;
  sr?: number;
  dfsId?: number;
  bitrate?: number;
  playTime?: number;
  volumeDelta?: number;
}

export interface Radio {
  dj?: null;
  category?: string;
  secondCategory?: string;
  buyed?: boolean;
  price?: number;
  originalPrice?: number;
  discountPrice?: null;
  purchaseCount?: number;
  lastProgramName?: null;
  videos?: null;
  finished?: boolean;
  underShelf?: boolean;
  liveInfo?: null;
  playCount?: number;
  privacy?: boolean;
  icon?: null;
  manualTagsDTO?: null;
  descPicList?: null;
  dynamic?: boolean;
  categoryId?: number;
  taskId?: number;
  lastProgramCreateTime?: number;
  programCount?: number;
  picId?: number;
  subCount?: number;
  shortName?: null;
  radioFeeType?: number;
  lastProgramId?: number;
  feeScope?: number;
  intervenePicUrl?: string;
  picUrl?: string;
  intervenePicId?: number;
  desc?: string;
  createTime?: number;
  name?: string;
  id?: number;
  subed?: boolean;
}

/**
 * 获取每日推荐电台
 */
export const getProgramRecommend = () => request.get<ProgramRecommend>('/program/recommend');