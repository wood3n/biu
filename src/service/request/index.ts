import axios, { type CreateAxiosDefaults } from "axios";

import { requestInterceptors } from "./request-interceptors";

const axiosConfig: CreateAxiosDefaults = {
  timeout: 10000,
  withCredentials: true,
};

export const axiosInstance = axios.create(axiosConfig);

export const searchRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://s.search.bilibili.com",
});

export const biliRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://www.bilibili.com",
});

export const apiRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://api.bilibili.com",
});

export const passportRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://passport.bilibili.com",
});

apiRequest.interceptors.request.use(requestInterceptors);
passportRequest.interceptors.request.use(requestInterceptors);
searchRequest.interceptors.request.use(requestInterceptors);

const geetestInterceptor = async (response: any) => {
  if (response?.data?.data?.v_voucher) {
    const { verifyGeetest } = await import("@/common/utils/geetest");
    const { postGaiaVGateRegister, postGaiaVGateValidate } = await import("@/service/gaia-vgate");

    // 获取 csrf token (bili_jct)
    const csrfMatch = document.cookie.match(/bili_jct=([^;]+)/);
    const csrf = csrfMatch ? csrfMatch[1] : "";

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

biliRequest.interceptors.response.use(geetestInterceptor);
apiRequest.interceptors.response.use(geetestInterceptor);
passportRequest.interceptors.response.use(geetestInterceptor);
searchRequest.interceptors.response.use(geetestInterceptor);

biliRequest.interceptors.response.use(res => res.data);
apiRequest.interceptors.response.use(res => res.data);
passportRequest.interceptors.response.use(res => res.data);
searchRequest.interceptors.response.use(res => res.data);
