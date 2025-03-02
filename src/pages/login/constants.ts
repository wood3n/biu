export enum QRLoginCode {
  /**
   * 二维码过期
   */
  Timeout = 800,
  /**
   * 等待扫码
   */
  WaitScan = 801,
  /**
   * 等待确认
   */
  WaitConfirm = 802,
  /**
   * 成功登录
   */
  Success = 803,
}
