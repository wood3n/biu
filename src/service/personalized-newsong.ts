import request from "./request";

export interface PersonalizedNewsongRequestParams {
  limit: number | undefined;
}

export interface PersonalizedNewsongData {
  code?: number;
  category?: number;
  result?: Result[];
}

export interface Result {
  id?: number;
  type?: number;
  name?: string;
  copywriter?: null;
  picUrl?: string;
  canDislike?: boolean;
  trackNumberUpdateTime?: null;
  song?: Song;
  alg?: string;
}

export interface Song {
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
  sqMusic?: Music;
  hrMusic?: Music;
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
  originCoverType?: number;
  originSongSimpleData?: null;
  single?: number;
  noCopyrightRcmd?: null;
  rtype?: number;
  rurl?: null;
  mvid?: number;
  bMusic?: Music;
  mp3Url?: null;
  hMusic?: Music;
  mMusic?: Music;
  lMusic?: Music;
  exclusive?: boolean;
  privilege?: Privilege;
}

export interface Album {
  name?: string;
  id?: number;
  type?: string;
  size?: number;
  picId?: number;
  blurPicUrl?: string;
  companyId?: number;
  pic?: number;
  picUrl?: string;
  publishTime?: number;
  description?: string;
  tags?: string;
  company?: string;
  briefDesc?: string;
  artist?: Artist;
  songs?: any[];
  alias?: any[];
  status?: number;
  copyrightId?: number;
  commentThreadId?: string;
  artists?: Artist[];
  subType?: string;
  transName?: null;
  onSale?: boolean;
  mark?: number;
  gapless?: number;
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
 * 推荐新音乐
 */
export const getPersonalizedNewsong = (params: PersonalizedNewsongRequestParams) => request.get<PersonalizedNewsongData>("/personalized/newsong", { params });
