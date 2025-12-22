/**
 * 动态类型
 * 参考：https://socialsisteryi.github.io/bilibili-API-collect/docs/dynamic/dynamic_enum.html#%E5%8A%A8%E6%80%81%E7%B1%BB%E5%9E%8B
 */
export enum DynamicType {
  /** 无效动态 */
  None = "DYNAMIC_TYPE_NONE",
  /** 动态转发 */
  Forward = "DYNAMIC_TYPE_FORWARD",
  /** 投稿视频 */
  Av = "DYNAMIC_TYPE_AV",
  /** 剧集（番剧、电影、纪录片） */
  Pgc = "DYNAMIC_TYPE_PGC",
  /** 课程 */
  Courses = "DYNAMIC_TYPE_COURSES",
  /** 纯文字动态 */
  Word = "DYNAMIC_TYPE_WORD",
  /** 带图动态 */
  Draw = "DYNAMIC_TYPE_DRAW",
  /** 投稿专栏 */
  Article = "DYNAMIC_TYPE_ARTICLE",
  /** 音乐 */
  Music = "DYNAMIC_TYPE_MUSIC",
  /** 装扮、剧集点评、普通分享 */
  CommonSquare = "DYNAMIC_TYPE_COMMON_SQUARE",
  /** 竖屏动态 */
  CommonVertical = "DYNAMIC_TYPE_COMMON_VERTICAL",
  /** 直播间分享 */
  Live = "DYNAMIC_TYPE_LIVE",
  /** 收藏夹 */
  Medialist = "DYNAMIC_TYPE_MEDIALIST",
  /** 课程 */
  CoursesSeason = "DYNAMIC_TYPE_COURSES_SEASON",
  /** 课程批次 */
  CoursesBatch = "DYNAMIC_TYPE_COURSES_BATCH",
  /** 广告 */
  Ad = "DYNAMIC_TYPE_AD",
  /** 小程序 */
  Applet = "DYNAMIC_TYPE_APPLET",
  /** 订阅 */
  Subscription = "DYNAMIC_TYPE_SUBSCRIPTION",
  /** 直播开播 */
  LiveRcmd = "DYNAMIC_TYPE_LIVE_RCMD",
  /** Banner */
  Banner = "DYNAMIC_TYPE_BANNER",
  /** 合集更新 */
  UgcSeason = "DYNAMIC_TYPE_UGC_SEASON",
  /** 新订阅 */
  SubscriptionNew = "DYNAMIC_TYPE_SUBSCRIPTION_NEW",
}

export enum FeedAuthorType {
  /** 点赞 */
  AuthorTypeNone = "AUTHOR_TYPE_NONE",
  /** 普通更新 */
  AuthorTypeNormal = "AUTHOR_TYPE_NORMAL",
  /** 剧集更新 */
  AuthorTypePgc = "AUTHOR_TYPE_PGC",
  /** 合集更新 */
  AuthorTypeUgcSeason = "AUTHOR_TYPE_UGC_SEASON",
}

/**
 * 动态主体类型
 */
export enum DynamicMajorType {
  /** 动态失效 */
  None = "MAJOR_TYPE_NONE",
  /** 图文动态 */
  Opus = "MAJOR_TYPE_OPUS",
  /** 视频 */
  Archive = "MAJOR_TYPE_ARCHIVE",
  /** 剧集更新 */
  Pgc = "MAJOR_TYPE_PGC",
  /** 课程 */
  Courses = "MAJOR_TYPE_COURSES",
  /** 带图动态 */
  Draw = "MAJOR_TYPE_DRAW",
  /** 专栏 */
  Article = "MAJOR_TYPE_ARTICLE",
  /** 音频更新 */
  Music = "MAJOR_TYPE_MUSIC",
  /** 一般类型 */
  Common = "MAJOR_TYPE_COMMON",
  /** 直播间分享 */
  Live = "MAJOR_TYPE_LIVE",
  /** 收藏夹 */
  Medialist = "MAJOR_TYPE_MEDIALIST",
  /** 小程序 */
  Applet = "MAJOR_TYPE_APPLET",
  /** 订阅 */
  Subscription = "MAJOR_TYPE_SUBSCRIPTION",
  /** 直播状态 */
  LiveRcmd = "MAJOR_TYPE_LIVE_RCMD",
  /** 合集更新 */
  UgcSeason = "MAJOR_TYPE_UGC_SEASON",
  /** 新订阅 */
  SubscriptionNew = "MAJOR_TYPE_SUBSCRIPTION_NEW",
}
