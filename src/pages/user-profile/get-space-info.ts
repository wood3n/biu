import { addToast } from "@heroui/react";

import { BiliErrorCode } from "@/common/constants/response-code";
import { postGaiaVgateRegister } from "@/service/gaia-vgate-register";
import { getSpaceWbiAccInfo } from "@/service/space-wbi-acc-info";

export async function getSpaceInfo(id: string) {
  const res = await getSpaceWbiAccInfo({
    mid: id,
  });

  if (res.code === 0) {
    return res.data;
  }

  if (res?.code === BiliErrorCode.RiskControlValidationFailed && res?.data?.v_voucher) {
    const getCaptchaRes = await postGaiaVgateRegister({
      v_voucher: res?.data?.v_voucher,
    });

    if (getCaptchaRes.code === 0) {
      addToast({
        title: "无法验证身份，请登录后操作",
        color: "danger",
      });
      return null;
    }
  }
}
