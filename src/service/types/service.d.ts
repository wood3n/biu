/**
 * 分页请求参数
 */
type PageRequest<T> = T & {
  limit: number;
  offset: number;
}

/**
 * 接口响应
 */
type APIResponse<T> = T & {
  code: number;
}

/**
 * 一般响应
 */
type APIResponseData<T> = APIResponse<{ data: T }>

/**
 * 嵌套响应
 */
type APIResponseNestData<T> = {
  data: T & {
    code: number;
  }
}

interface Ar {
  id: number;
  name: string;
  tns?: any[];
  alias?: any[];
}

interface Al {
  id?: number;
  name?: string;
  picUrl?: string;
  tns?: any[];
  pic_str?: string;
  pic?: number;
}

interface H {
  br?: number;
  fid?: number;
  size?: number;
  vd?: number;
}

interface FreeTrialPrivilege {
  resConsumable?: boolean;
  userConsumable?: boolean;
  listenType?: number;
}

interface ChargeInfoList {
  rate?: number;
  chargeUrl?: null;
  chargeMessage?: null;
  chargeType?: number;
}

/**
 * 特权
 */
interface Privilege {
  id?: number;
  fee?: number;
  payed?: number;
  /**
   * -200无版权
   */
  st?: number;
  pl?: number;
  dl?: number;
  sp?: number;
  cp?: number;
  subp?: number;
  /**
   * 云盘
   */
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

interface Song {
  name?: string;
  id: number;
  pst?: number;
  t?: number;
  ar: Ar[];
  alia?: any[];
  pop?: number;
  st?: number;
  rt?: string;
  /**
    8、0：免费
    4：所在专辑需单独付费
    1：VIP可听
   */
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
  /**
   * 当前播放歌曲
   */
  playing?: boolean;
}
