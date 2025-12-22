import type { AxiosResponse } from "axios";

import axios from "axios";

export const geetestInterceptors = async (response: AxiosResponse) => {
  if (response?.data?.data?.v_voucher) {
    const { verifyGeetest } = await import("@/common/utils/geetest");
    const { postGaiaVGateRegister, postGaiaVGateValidate } = await import("@/service/gaia-vgate");

    // 获取 csrf token (bili_jct)
    const csrf = await window.electron.getCookie("bili_jct");

    const v_voucher = response.data.data.v_voucher;

    // 1. 调用 register 接口获取极验参数
    const getCaptchaParams = () => postGaiaVGateRegister({ v_voucher, csrf });

    // 2. 唤起极验验证
    const result = await verifyGeetest(getCaptchaParams);

    if (result) {
      // 3. 调用 validate 接口获取 grisk_id (gaia_vtoken)
      const validateRes = await postGaiaVGateValidate({
        challenge: result.challenge,
        token: result.token,
        validate: result.validate,
        seccode: result.seccode,
        csrf,
      });

      if (validateRes.code === 0 && validateRes.data?.grisk_id) {
        const gaia_vtoken = validateRes.data.grisk_id;
        const config = response.config;

        // 4. 原 URL 参数加入 gaia_vtoken
        config.params = { ...config.params, gaia_vtoken };

        // 5. Cookie 加入 x-bili-gaia-vtoken
        await window.electron.setCookie("x-bili-gaia-vtoken", gaia_vtoken);

        return axios(config);
      }
    }
  }
  return response;
};
