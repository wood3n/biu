import { type InternalAxiosRequestConfig } from "axios";

import { encodeParamsWbi } from "@/common/utils/wbi-sign";

export const requestInterceptors = async (config: InternalAxiosRequestConfig) => {
  if (config.useCSRF) {
    const csrfToken = await window.electron.getCookie("bili_jct");
    if (csrfToken) {
      if (config.method === "post") {
        config.data ??= {};
        config.data.csrf = csrfToken;
      } else {
        config.params ??= {};
        config.params.csrf = csrfToken;
      }
    }
  }

  if (config.useWbi) {
    config.params ??= {};
    config.params = await encodeParamsWbi(config.params);
  }

  if (config.useFormData) {
    const formData = new FormData();
    for (const key in config.data) {
      formData.append(key, config.data[key]);
    }
    config.data = formData;
  }

  return config;
};
