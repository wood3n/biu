import request from "./request";

export interface PlaylistDetailRequestParams {
  id: string | undefined;
  /**
   * 歌单最近的 s 个收藏者,默认为 8
   */
  s?: string | undefined;
}

export interface PlaylistDetailResponse {
  code?: number;
  relatedVideos?: null;
  playlist?: Playlist;
  urls?: null;
  privileges?: Privilege[];
  sharedPrivilege?: null;
  resEntrance?: null;
  fromUsers?: null;
  fromUserCount?: number;
  songFromUsers?: null;
}

export interface Playlist {
  id?: number;
  name?: string;
  coverImgId?: number;
  coverImgUrl?: string;
  coverImgId_str?: string;
  adType?: number;
  userId?: number;
  createTime?: number;
  status?: number;
  opRecommend?: boolean;
  highQuality?: boolean;
  newImported?: boolean;
  updateTime?: number;
  trackCount?: number;
  specialType?: number;
  privacy?: number;
  trackUpdateTime?: number;
  commentThreadId?: string;
  playCount?: number;
  trackNumberUpdateTime?: number;
  subscribedCount?: number;
  cloudTrackCount?: number;
  ordered?: boolean;
  description?: null;
  tags?: any[];
  updateFrequency?: null;
  backgroundCoverId?: number;
  backgroundCoverUrl?: null;
  titleImage?: number;
  titleImageUrl?: null;
  englishTitle?: null;
  officialPlaylistType?: null;
  copied?: boolean;
  relateResType?: null;
  subscribers?: any[];
  subscribed?: boolean;
  creator?: Creator;
  tracks?: Track[];
  videoIds?: null;
  videos?: null;
  trackIds?: TrackID[];
  bannedTrackIds?: null;
  mvResourceInfos?: null;
  shareCount?: number;
  commentCount?: number;
  remixVideo?: null;
  sharedUsers?: null;
  historySharedUsers?: null;
  gradeStatus?: string;
  score?: null;
  algTags?: null;
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

export interface TrackID {
  id?: number;
  v?: number;
  t?: number;
  at?: number;
  alg?: null;
  uid?: number;
  rcmdReason?: string;
  sc?: null;
  f?: null;
  sr?: null;
}

export interface Track {
  name?: string;
  id?: number;
  pst?: number;
  t?: number;
  ar?: Ar[];
  alia?: string[];
  pop?: number;
  st?: number;
  rt?: null | string;
  fee?: number;
  v?: number;
  crbt?: null;
  cf?: string;
  al?: Al;
  dt?: number;
  h?: L | null;
  m?: L;
  l?: L;
  sq?: L | null;
  hr?: L | null;
  a?: null;
  cd?: string;
  no?: number;
  rtUrl?: null;
  ftype?: number;
  rtUrls?: any[];
  djId?: number;
  copyright?: number;
  s_id?: number;
  mark?: number;
  originCoverType?: number;
  originSongSimpleData?: null;
  tagPicList?: null;
  resourceState?: boolean;
  version?: number;
  songJumpInfo?: null;
  entertainmentTags?: null;
  single?: number;
  noCopyrightRcmd?: NoCopyrightRcmd | null;
  rtype?: number;
  rurl?: null;
  mst?: number;
  cp?: number;
  mv?: number;
  publishTime?: number;
  tns?: string[];
  pc?: PC;
}

export interface Al {
  id?: number;
  name?: string;
  picUrl?: string;
  tns?: any[];
  pic_str?: string;
  pic?: number;
}

export interface Ar {
  id?: number;
  name?: string;
  tns?: any[];
  alias?: any[];
}

export interface L {
  br?: number;
  fid?: number;
  size?: number;
  vd?: number;
  sr?: number;
}

export interface NoCopyrightRcmd {
  type?: number;
  typeDesc?: string;
  songId?: null;
}

export interface PC {
  nickname?: string;
  fn?: string;
  cid?: string;
  alb?: string;
  ar?: string;
  br?: number;
  uid?: number;
  version?: number;
  sn?: string;
}

export interface Privilege {
  id?: number;
  fee?: number;
  payed?: number;
  realPayed?: number;
  st?: number;
  pl?: number;
  dl?: number;
  sp?: number;
  cp?: number;
  subp?: number;
  cs?: boolean;
  maxbr?: number;
  fl?: number;
  pc?: null;
  toast?: boolean;
  flag?: number;
  paidBigBang?: boolean;
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
 * 获取歌单详情
 */
export const getPlaylistDetail = (params: PlaylistDetailRequestParams) => request.get<PlaylistDetailResponse>("/playlist/detail", { params });
