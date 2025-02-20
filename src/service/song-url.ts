import request from "./request";

export interface SongUrlRequestParams {
  id: number | undefined;
  br: number | undefined;
}

export interface SongURLRes {
  data?: Datum[];
  code?: number;
}

export interface Datum {
  id?: number;
  url?: string;
  br?: number;
  size?: number;
  md5?: string;
  code?: number;
  expi?: number;
  type?: string;
  gain?: number;
  peak?: number;
  fee?: number;
  uf?: null;
  payed?: number;
  flag?: number;
  canExtend?: boolean;
  freeTrialInfo?: null;
  level?: string;
  encodeType?: string;
  freeTrialPrivilege?: FreeTrialPrivilege;
  freeTimeTrialPrivilege?: FreeTimeTrialPrivilege;
  urlSource?: number;
  rightSource?: number;
  podcastCtrp?: null;
  effectTypes?: null;
  time?: number;
}

export interface FreeTimeTrialPrivilege {
  resConsumable?: boolean;
  userConsumable?: boolean;
  type?: number;
  remainTime?: number;
}

export interface FreeTrialPrivilege {
  resConsumable?: boolean;
  userConsumable?: boolean;
  listenType?: null;
  cannotListenReason?: null;
}

/*
 * 获取音乐 url
 */
export const getSongUrl = (params: SongUrlRequestParams) => request.get<SongURLRes>("/song/url", { params });
