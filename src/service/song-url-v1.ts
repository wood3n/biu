import request from "./request";

export interface SongUrlV1RequestParams {
  id: number | undefined;
  level: string | undefined;
}

export interface SongURLRes {
  data?: Datum[];
  code?: number;
}

export interface Datum {
  id?: number;
  url?: string; // src
  br?: number; // 码率
  size?: number; // 文件大小
  md5?: string;
  code?: number;
  expi?: number;
  type?: string; // 文件类型
  gain?: number;
  peak?: number;
  fee?: number;
  uf?: null;
  payed?: number;
  flag?: number;
  canExtend?: boolean;
  freeTrialInfo?: null;
  level?: string; // 音质标准
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
 * 获取音乐 url - 新版
 */
export const getSongUrlV1 = (params: SongUrlV1RequestParams) => request.get<SongURLRes>("/song/url/v1", { params });
