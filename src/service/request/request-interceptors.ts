import { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

import { encodeParamsWbi } from "@/common/utils/wbi-sign";

export const requestInterceptors = (config: InternalAxiosRequestConfig) => {
  if (config.useFormData) {
    const formData = new FormData();
    for (const key in config.data) {
      formData.append(key, config.data[key]);
    }
    config.data = formData;
  }

  if (config.useCSRF) {
    const csrfToken = Cookies.get("bili_jct");
    if (csrfToken) {
      config.params.csrf = csrfToken;
    }
  }

  if (config.useWbi) {
    config.params = encodeParamsWbi(config.params);
  }

  return config;
};
