import { type InternalAxiosRequestConfig } from "axios";
import moment from "moment";

import { refreshCookie } from "@/common/utils/cookie";
import { useToken } from "@/store/token";
import { tauriAdapter } from "@/utils/tauri-adapter";

import { encodeParamsWbi } from "./wbi-sign";

let refreshCookiePromise: Promise<any> | null = null;

export const requestInterceptors = async (config: InternalAxiosRequestConfig) => {
  if (!config.skipRefreshCheck && (useToken.getState().nextCheckRefreshTime || 0) < moment().unix()) {
    if (!refreshCookiePromise) {
      useToken.setState({ nextCheckRefreshTime: moment().add(30, "seconds").unix() });
      refreshCookiePromise = refreshCookie().finally(() => {
        refreshCookiePromise = null;
      });
    }
    try {
      await refreshCookiePromise;
    } finally {
      useToken.setState({ nextCheckRefreshTime: moment().add(2, "days").unix() });
    }
  }

  if (config.useCSRF) {
    const csrfToken = await tauriAdapter.getCookie("bili_jct");
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
