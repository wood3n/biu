import type { OnBeforeSendHeadersListenerDetails, OnHeadersReceivedListenerDetails } from "electron";

import httpCookie from "cookie";
import { session } from "electron";

import { UserAgent } from "./user-agent";

export function installWebRequestInterceptors() {
  const urls = ["http://*/*", "https://*/*"],
    origin = "https://www.bilibili.com",
    referer = "https://www.bilibili.com";

  const onBeforeSendHeadersHandler = async (
    details: OnBeforeSendHeadersListenerDetails,
    callback: (response: { requestHeaders?: Record<string, string> }) => void,
  ) => {
    const headers = details.requestHeaders || {};

    headers["Referer"] = referer;
    headers["Origin"] = origin; // 与响应注入的 Allow-Origin 保持一致
    headers["User-Agent"] = UserAgent;

    callback({ requestHeaders: headers });
  };

  // 新增：响应头拦截，重写 Set-Cookie 的 SameSite 与 Secure
  const onHeadersReceivedHandler = (
    details: OnHeadersReceivedListenerDetails,
    callback: (response: { responseHeaders?: Record<string, string | string[]> }) => void,
  ) => {
    const responseHeaders = details.responseHeaders || {};
    const setCookieKey = Object.keys(responseHeaders).find(k => k.toLowerCase() === "set-cookie");

    if (!setCookieKey) {
      callback({ responseHeaders });
      return;
    }

    const raw = responseHeaders[setCookieKey.toLowerCase()];
    const cookies = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];

    const rewritten = cookies.map(cookie => {
      const setCookieObject = httpCookie.parseSetCookie(cookie);
      setCookieObject.sameSite = "none";
      setCookieObject.secure = true;

      return httpCookie.stringifySetCookie(setCookieObject);
    });

    responseHeaders[setCookieKey] = rewritten;
    callback({ responseHeaders });
  };

  session.defaultSession.webRequest.onBeforeSendHeaders({ urls }, onBeforeSendHeadersHandler);
  session.defaultSession.webRequest.onHeadersReceived({ urls }, onHeadersReceivedHandler);
}
