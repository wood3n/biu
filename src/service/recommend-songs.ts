import request from './request';

export interface Ar {
  id: number;
  name: string;
  tns?: any[];
  alias?: any[];
}

export interface Al {
  id?: number;
  name?: string;
  picUrl?: string;
  tns?: any[];
  pic_str?: string;
  pic?: number;
}

export interface H {
  br?: number;
  fid?: number;
  size?: number;
  vd?: number;
}

export interface FreeTrialPrivilege {
  resConsumable?: boolean;
  userConsumable?: boolean;
  listenType?: number;
}

export interface ChargeInfoList {
  rate?: number;
  chargeUrl?: null;
  chargeMessage?: null;
  chargeType?: number;
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

export interface DailySong {
  name?: string;
  id: number;
  pst?: number;
  t?: number;
  ar: Ar[];
  alia?: any[];
  pop?: number;
  st?: number;
  rt?: string;
  fee?: number;
  v?: number;
  crbt?: null;
  cf?: string;
  al?: Al;
  dt: number;
  /**
   * 品质，h为320hz，最高
   */
  h?: H;
  m?: H;
  l?: H;
  sq?: H;
  hr?: null;
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
  noCopyrightRcmd?: null;
  rtype?: number;
  rurl?: null;
  mst?: number;
  cp?: number;
  mv?: number;
  publishTime?: number;
  reason?: string;
  privilege?: Privilege;
  alg?: string;
}

export interface RecommendReasons {
  songId?: number;
  reason?: string;
  reasonId?: string;
  targetUrl?: null;
}

export interface DayRecommendData {
  dailySongs: Song[];
  recommendReasons: RecommendReasons[];
}

/*
 * 获取每日推荐歌曲
 */
export const getRecommendSongs = () => request.get<APIResponseNestData<DayRecommendData>>('/recommend/songs');
