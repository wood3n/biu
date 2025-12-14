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

  // Handle Data (FormData -> Object for JSON serialization, or keep object)
  let requestBody = data;
  if (data instanceof FormData) {
    requestBody = {};
    data.forEach((value, key) => {
      requestBody[key] = value;
    });
    // Explicitly set content type so Rust backend knows to treat as Form
    requestHeaders["Content-Type"] = "application/x-www-form-urlencoded";
  }

  try {
    let responseData;
    if (method === "get") {
      responseData = await tauriAdapter.httpGet(fullUrl!, {
        params,
        headers: requestHeaders,
      });
    } else if (method === "post") {
      responseData = await tauriAdapter.httpPost(fullUrl!, requestBody, {
        params,
        headers: requestHeaders,
      });
    } else {
      throw new Error(`Method ${method} not supported by Tauri adapter`);
    }

    return {
      data: responseData,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      request: {},
    };
  } catch (error: any) {
    // If Rust returns an error string, try to reject properly
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
