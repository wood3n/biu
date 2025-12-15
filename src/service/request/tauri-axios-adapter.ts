import { type AxiosAdapter } from "axios";

import { tauriAdapter } from "@/utils/tauri-adapter";

export const tauriAxiosAdapter: AxiosAdapter = async config => {
  const { url, method, params, headers, data, baseURL } = config;
  const fullUrl = baseURL ? `${baseURL}${url}` : url;

  // Transform Headers
  const requestHeaders: Record<string, string> = {};
  if (headers) {
    Object.keys(headers).forEach(key => {
      const val = headers[key];
      if (val !== undefined && val !== null) {
        requestHeaders[key] = String(val);
      }
    });
  }

  // Handle Data
  let requestBody = data;
  if (data instanceof FormData) {
    requestBody = {};
    data.forEach((value, key) => {
      requestBody[key] = value;
    });
    requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
  }

  try {
    // USE THE GENERIC REQUEST FOR ALL METHODS
    const responseData = await tauriAdapter.httpRequest(method || "GET", fullUrl!, requestBody, {
      params,
      headers: requestHeaders,
    });

    return {
      data: responseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      request: {},
    };
  } catch (error: any) {
    return Promise.reject({
      message: typeof error === "string" ? error : "Network Error",
      config,
      response: {
        status: 500,
        data: error,
      },
    });
  }
};
