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

  export interface UserAccount {
    code?: number;
    account?: Account;
    profile?: UserAccountProfile;
  }

  export interface Account {
    id?: number;
    userName?: string;
    type?: number;
    status?: number;
    whitelistAuthority?: number;
    createTime?: number;
    tokenVersion?: number;
    ban?: number;
    baoyueVersion?: number;
    donateVersion?: number;
    vipType?: number;
    anonimousUser?: boolean;
    paidFee?: boolean;
  }

  export interface UserAccountProfile {
    userId?: number;
    userType?: number;
    nickname?: string;
    avatarImgId?: number;
    avatarUrl?: string;
    backgroundImgId?: number;
    backgroundUrl?: string;
    signature?: string;
    createTime?: number;
    userName?: string;
    accountType?: number;
    shortUserName?: string;
    birthday?: number;
    authority?: number;
    gender?: number;
    accountStatus?: number;
    province?: number;
    city?: number;
    authStatus?: number;
    description?: null;
    detailDescription?: null;
    defaultAvatar?: boolean;
    expertTags?: null;
    experts?: null;
    djStatus?: number;
    locationStatus?: number;
    vipType?: number;
    followed?: boolean;
    mutual?: boolean;
    authenticated?: boolean;
    lastLoginTime?: number;
    lastLoginIP?: string;
    remarkName?: null;
    viptypeVersion?: number;
    authenticationTypes?: number;
    avatarDetail?: null;
    anchor?: boolean;
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
    profile?: UserDetailProfile;
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

  export interface UserDetailProfile {
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

  export interface UserAcountStats {
    programCount?: number;
    djRadioCount?: number;
    mvCount?: number;
    artistCount?: number;
    newProgramCount?: number;
    createDjRadioCount?: number;
    createdPlaylistCount?: number;
    subPlaylistCount?: number;
    code?: number;
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

  export interface PersonalFMData {
    popAdjust?: boolean;
  }

  export interface PersonalFMSong {
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
    sqMusic?: null;
    hrMusic?: null;
    ringtone?: null;
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
    privilege?: Privilege;
    alg?: string;
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
    company?: null;
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

  export interface ChargeInfoList {
    rate?: number;
    chargeUrl?: null;
    chargeMessage?: null;
    chargeType?: number;
  }

  export interface SearchDefaultDataType {
    showKeyword?: string;
    styleKeyword?: StyleKeyword;
    realkeyword?: string;
    searchType?: number;
    action?: number;
    alg?: string;
    gap?: number;
    source?: null;
    bizQueryInfo?: string;
    logInfo?: null;
    imageUrl?: null;
  }

  export interface StyleKeyword {
    keyWord?: string;
    descWord?: null;
  }

  export interface SearchSuggestionRes {
    result: SearchSuggestion;
  }

  export interface SearchSuggestion {
    albums?: SearchAlbumElement[];
    artists?: SearchArtist[];
    songs?: SearchSong[];
    playlists?: SearchPlayList[];
    order?: string[];
  }

  export interface SearchAlbumElement {
    id?: number;
    name?: string;
    artist?: Artist;
    publishTime?: number;
    size?: number;
    copyrightId?: number;
    status?: number;
    picId?: number;
    mark?: number;
  }

  export interface SearchArtist {
    id?: number;
    name?: string;
    picUrl?: null | string;
    alias?: string[];
    albumSize?: number;
    picId?: number;
    fansGroup?: null;
    img1v1Url?: string;
    img1v1?: number;
    alia?: string[];
    trans?: null;
    accountId?: number;
  }

  export interface SearchSong {
    id?: number;
    name?: string;
    artists?: Artist[];
    album?: SongAlbum;
    duration?: number;
    copyrightId?: number;
    status?: number;
    alias?: string[];
    rtype?: number;
    ftype?: number;
    mvid?: number;
    fee?: number;
    rUrl?: null;
    mark?: number;
  }

  export interface SongAlbum {
    id?: number;
    name?: string;
    artist?: Artist;
    publishTime?: number;
    size?: number;
    copyrightId?: number;
    status?: number;
    picId?: number;
    mark?: number;
    alia?: string[];
  }

  export interface SearchPlayList {
    id?: number;
    name?: string;
    coverImgUrl?: string;
    creator?: null;
    subscribed?: boolean;
    trackCount?: number;
    userId?: number;
    playCount?: number;
    bookCount?: number;
    specialType?: number;
    officialTags?: null;
    action?: null;
    actionType?: null;
    recommendText?: null;
    score?: null;
    description?: string;
    highQuality?: boolean;
  }

  export interface PersonalPlayListReq {
    uid: number;
    limit: number;
    offset: number;
  }

  export interface PersonalPlayList {
    version?: string;
    more?: boolean;
    playlist?: PlaylistInfoType[];
    code?: number;
  }

  export interface PlaylistInfoType {
    subscribers?: any[];
    subscribed?: boolean;
    creator?: Creator;
    artists?: null;
    tracks?: null;
    updateFrequency?: null | string;
    backgroundCoverId?: number;
    backgroundCoverUrl?: null | string;
    titleImage?: number;
    titleImageUrl?: null | string;
    englishTitle?: null | string;
    opRecommend?: boolean;
    recommendInfo?: RecommendInfo | null;
    subscribedCount?: number;
    cloudTrackCount?: number;
    userId?: number;
    totalDuration?: number;
    coverImgId?: number;
    privacy?: number;
    trackUpdateTime?: number;
    trackCount?: number;
    updateTime?: number;
    commentThreadId?: string;
    coverImgUrl?: string;
    specialType?: number;
    anonimous?: boolean;
    createTime?: number;
    highQuality?: boolean;
    newImported?: boolean;
    trackNumberUpdateTime?: number;
    playCount?: number;
    adType?: number;
    description?: null | string;
    tags?: string[];
    ordered?: boolean;
    status?: number;
    name?: string;
    id?: number;
    coverImgId_str?: null | string;
    sharedUsers?: null;
    shareStatus?: null;
    copied?: boolean;
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

  export interface RecommendInfo {
    alg?: string;
    logInfo?: string;
  }

}

