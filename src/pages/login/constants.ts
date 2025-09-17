import { type AlertProps } from "@heroui/react";

export enum QRLoginCode {
  /**
   * 二维码过期
   */
  Timeout = 86038,
  /**
   * 等待扫码
   */
  WaitScan = 86101,
  /**
   * 成功登录
   */
  Success = 0,
}

export const QRLoginCodeMap = {
  [QRLoginCode.Timeout]: "二维码过期",
  [QRLoginCode.WaitScan]: "等待扫码",
  [QRLoginCode.Success]: "成功登录",
};

export const QRLoginStatusColorMap: Record<QRLoginCode, AlertProps["color"]> = {
  [QRLoginCode.Timeout]: "warning",
  [QRLoginCode.WaitScan]: "primary",
  [QRLoginCode.Success]: "success",
};
