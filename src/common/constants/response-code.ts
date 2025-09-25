/**
 * Bilibili Common Error Codes
 * Source: https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/errcode.html
 */

export enum BiliErrorCode {
  /** 应用程序不存在或已被封禁 */
  AppNotFoundOrBanned = -1,
  /** Access Key 错误 */
  AccessKeyError = -2,
  /** API 校验密匙错误 */
  ApiValidationKeyError = -3,
  /** 调用方对该 Method 没有权限 */
  NoPermissionForMethod = -4,
  /** 账号未登录 */
  NotLoggedIn = -101,
  /** 账号被封停 */
  AccountBanned = -102,
  /** 积分不足 */
  InsufficientPoints = -103,
  /** 硬币不足 */
  InsufficientCoins = -104,
  /** 验证码错误 */
  CaptchaError = -105,
  /** 账号非正式会员或在适应期 */
  NotFormalMemberOrAdaptationPeriod = -106,
  /** 应用不存在或者被封禁 */
  AppNotExistOrBanned = -107,
  /** 未绑定手机 */
  PhoneNotBound = -108,
  /** 未绑定手机 */
  PhoneNotBoundAlt = -110,
  /** csrf 校验失败 */
  CsrfValidationFailed = -111,
  /** 系统升级中 */
  SystemUpgrading = -112,
  /** 账号尚未实名认证 */
  RealNameVerificationRequired = -113,
  /** 请先绑定手机 */
  PleaseBindPhone = -114,
  /** 请先完成实名认证 */
  PleaseCompleteRealNameVerification = -115,

  /** 木有改动 */
  NotModified = -304,
  /** 撞车跳转 */
  RedirectCollision = -307,
  /** 风控校验失败 (UA 或 wbi 参数不合法) */
  RiskControlValidationFailed = -352,
  /** 请求错误 */
  BadRequest = -400,
  /** 未认证 (或非法请求) */
  UnauthorizedOrIllegalRequest = -401,
  /** 访问权限不足 */
  Forbidden = -403,
  /** 啥都木有 */
  NotFound = -404,
  /** 不支持该方法 */
  MethodNotAllowed = -405,
  /** 冲突 */
  Conflict = -409,
  /** 请求被拦截 (客户端 ip 被服务端风控) */
  RequestInterceptedByRiskControl = -412,
  /** 服务器错误 */
  InternalServerError = -500,
  /** 过载保护,服务暂不可用 */
  ServiceUnavailableDueToOverload = -503,
  /** 服务调用超时 */
  ServiceCallTimeout = -504,
  /** 超出限制 */
  ExceededLimit = -509,
  /** 上传文件不存在 */
  UploadedFileDoesNotExist = -616,
  /** 上传文件太大 */
  UploadedFileTooLarge = -617,
  /** 登录失败次数太多 */
  TooManyFailedLoginAttempts = -625,
  /** 用户不存在 */
  UserDoesNotExist = -626,
  /** 密码太弱 */
  PasswordTooWeak = -628,
  /** 用户名或密码错误 */
  InvalidUsernameOrPassword = -629,
  /** 操作对象数量限制 */
  OperationObjectQuantityLimit = -632,
  /** 被锁定 */
  Locked = -643,
  /** 用户等级太低 */
  UserLevelTooLow = -650,
  /** 重复的用户 */
  DuplicateUser = -652,
  /** Token 过期 */
  TokenExpired = -658,
  /** 密码时间戳过期 */
  PasswordTimestampExpired = -662,
  /** 地理区域限制 */
  GeographicRestriction = -688,
  /** 版权限制 */
  CopyrightRestriction = -689,
  /** 扣节操失败 */
  DeductionOfMoralPointsFailed = -701,
  /** 请求过于频繁,请稍后再试 */
  TooManyRequests = -799,
  /** 对不起,服务器开小差了~ (ಥ_ಥ) */
  ServerBusy = -8888,
}
