import type { OnBeforeSendHeadersListenerDetails } from "electron";

import { session } from "electron";

import { UserAgent } from "./user-agent";

export function installWebRequestInterceptors(): { dispose: () => void } {
  const urls = ["http://*/*", "https://*/*"],
    origin = "https://www.bilibili.com",
    referer = "https://www.bilibili.com";

  let active = true;
  const filter = { urls };

  const onBeforeSendHeadersHandler = async (
    details: OnBeforeSendHeadersListenerDetails,
    callback: (response: { requestHeaders?: Record<string, string> }) => void,
  ) => {
    if (!active) {
      callback({ requestHeaders: details.requestHeaders });
      return;
    }

    const headers = details.requestHeaders || {};

    headers["Referer"] = referer;
    headers["Origin"] = origin; // 与响应注入的 Allow-Origin 保持一致
    headers["User-Agent"] = UserAgent;

    callback({ requestHeaders: headers });
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, onBeforeSendHeadersHandler);

  return {
    dispose: () => {
      active = false;
    },
  };
}
