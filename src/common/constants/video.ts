/**
 * Bilibili 视频清晰度（qn）
 * Source: https://socialsisteryi.github.io/bilibili-API-collect/docs/bangumi/videostream_url.html
 * 说明：该值在 DASH 模式且非下载模式时无效
 */
export enum VideoQuality {
  /**
   * 240P 极速
   * 备注：仅 MP4 方式支持
   */
  Q240P = 6,

  /**
   * 360P 流畅
   */
  Q360P = 16,

  /**
   * 480P 清晰
   */
  Q480P = 32,

  /**
   * 720P 高清
   * 备注：WEB 端默认值；前端需登录才能选择，但直接发起请求可不登录获取 720P 取流；无 720P 时则为 720P60
   */
  Q720P = 64,

  /**
   * 720P60 高帧率
   * 备注：需要认证登录账号
   */
  Q720P60 = 74,

  /**
   * 1080P 高清
   * 备注：WEB 端与 APP 端默认值；需要认证登录账号
   */
  Q1080P = 80,

  /**
   * 智能修复（AI 画质增强）
   * 备注：仅支持 DASH 格式；需要 fnval & 12240 = 12240；需要认证登录账号
   */
  SmartEnhance = 100,

  /**
   * 1080P+ 高码率
   * 备注：大多情况需要大会员认证
   */
  Q1080PPlus = 112,

  /**
   * 1080P60 高帧率
   * 备注：大多情况需要大会员认证
   */
  Q1080P60 = 116,

  /**
   * 4K 超清
   * 备注：需要 fnval & 128 = 128 且 fourk = 1；大多情况需要大会员认证
   */
  Q4K = 120,

  /**
   * HDR 真彩色
   * 备注：仅支持 DASH 格式；需要 fnval & 64 = 64；大多情况需要大会员认证
   */
  HDR = 125,

  /**
   * 杜比视界（Dolby Vision）
   * 备注：仅支持 DASH 格式；需要 fnval & 512 = 512；大多情况需要大会员认证
   */
  DolbyVision = 126,

  /**
   * 8K 超高清
   * 备注：仅支持 DASH 格式；需要 fnval & 1024 = 1024；大多情况需要大会员认证
   */
  Q8K = 127,
}
