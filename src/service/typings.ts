// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare module API {
  interface SendCaptchaReqParam {
    phone: string;
  }

  interface SendCaptchaRes {
    phone: string;
  }

  interface PhoneLoginData {
    phone: string;
    captcha: string;
  }

  interface BaseRes {
    code: number;
    data: boolean;
  }

  interface QrLoginkey {
    data: {
      code: number;
      unikey: string;
    }
  }

  interface QrLoginImg {
    data: {
      /**
       * base64
       */
      qrimg: string;
      qrUrl: string;
    }
  }

  interface QrLoginRes {
    code: number;
    cookie: string;
    message: string;
  }

  interface UserAccount {
    id: number;
  }

  interface UserProfile {
    userId: number;
  }

  interface UserStatus {
    account: UserProfile;
    profile: UserProfile;
  }

  /**
   * 用户详情
   */
  export interface UserDetail {
    level?: number;
    listenSongs?: number;
    userPoint?: UserPoint;
    mobileSign?: boolean;
    pcSign?: boolean;
    profile?: Profile;
    peopleCanSeeMyPlayRecord?: boolean;
    bindings?: any[];
    adValid?: boolean;
    code?: number;
    newUser?: boolean;
    recallUser?: boolean;
    createTime?: number;
    createDays?: number;
    profileVillageInfo?: ProfileVillageInfo;
  }

  export interface Profile {
    privacyItemUnlimit?: PrivacyItemUnlimit;
    avatarDetail?: null;
    avatarImgIdStr?: string;
    backgroundImgIdStr?: string;
    accountStatus?: number;
    mutual?: boolean;
    avatarUrl?: string;
    backgroundImgId?: number;
    backgroundUrl?: string;
    province?: number;
    city?: number;
    remarkName?: null;
    authStatus?: number;
    detailDescription?: string;
    experts?: Record<string, unknown>;
    expertTags?: null;
    birthday?: number;
    gender?: number;
    nickname?: string;
    description?: string;
    createTime?: number;
    userType?: number;
    userId?: number;
    vipType?: number;
    avatarImgId?: number;
    defaultAvatar?: boolean;
    djStatus?: number;
    followed?: boolean;
    signature?: string;
    authority?: number;
    followeds?: number;
    follows?: number;
    blacklist?: boolean;
    eventCount?: number;
    allSubscribedCount?: number;
    playlistBeSubscribedCount?: number;
    avatarImgId_str?: string;
    followTime?: null;
    followMe?: boolean;
    artistIdentity?: any[];
    cCount?: number;
    inBlacklist?: boolean;
    sDJPCount?: number;
    playlistCount?: number;
    sCount?: number;
    newFollows?: number;
  }

  export interface PrivacyItemUnlimit {
    area?: boolean;
    college?: boolean;
    age?: boolean;
    villageAge?: boolean;
  }

  export interface ProfileVillageInfo {
    title?: string;
    imageUrl?: string;
    targetUrl?: string;
  }

  export interface UserPoint {
    userId?: number;
    balance?: number;
    updateTime?: number;
    version?: number;
    status?: number;
    blockBalance?: number;
  }

  interface DayRecommendData {
    dailySongs: DailySong[];
    recommendReasons: RecommendReasons[];
  }

  /**
   * 推荐歌曲详情
   */
  export interface DailySong {
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

  export interface H {
    br?: number;
    fid?: number;
    size?: number;
    vd?: number;
    sr?: number;
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
    listenType?: number;
  }

  export interface RecommendReasons {
    songId?: number;
    reason?: string;
    reasonId?: string;
    targetUrl?: null;
  }
}

