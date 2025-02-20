import request from "./request";

export interface UserRecordRequestParams {
  uid: number | undefined;
  type: string | undefined;
}

export interface Ar {
  id?: number;
  name?: string;
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
  sr?: number;
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

export interface Song {
  name?: string;
  id?: number;
  pst?: number;
  t?: number;
  ar?: Ar[];
  alia?: any[];
  pop?: number;
  st?: number;
  rt?: string;
  fee?: number;
  v?: number;
  crbt?: null;
  cf?: string;
  al?: Al;
  dt?: number;
  h?: H;
  m?: H;
  l?: H;
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
  single?: number;
  noCopyrightRcmd?: null;
  rtype?: number;
  rurl?: null;
  mst?: number;
  cp?: number;
  mv?: number;
  publishTime?: number;
  privilege?: Privilege;
}

export interface UserRecordDatum {
  playCount?: number;
  score?: number;
  song: Song;
}

export interface UserPlayRecord {
  weekData?: UserRecordDatum[];
  allData?: UserRecordDatum[];
}

/*
 * 获取用户播放记录，type=1 时只返回 weekData, type=0 时返回 allData
 */
export const getUserRecord = (params: UserRecordRequestParams) => request.get<APIResponse<UserPlayRecord>>("/user/record", { params });
