import type { Session } from "electron";
import type { OnBeforeSendHeadersListenerDetails, OnHeadersReceivedListenerDetails } from "electron";

export function stripDomainFromSetCookie(cookies: string[]): string[] {
  return cookies.map(cookieStr =>
    cookieStr
      .replace(/;\s*Domain=[^;]+/gi, "")
      .replace(/;\s*Secure/gi, "")
      .replace(/;\s*SameSite=None/gi, "")
      .replace(/;\s*;+/g, ";")
      .replace(/;\s*$/, ""),
  );
}

export function installWebRequestInterceptors(sess: Session): { dispose: () => void } {
  const urls = ["*://*/*"],
    referer = "https://www.bilibili.com",
    origin = "https://www.bilibili.com",
    userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

  let active = true;
  const filter = { urls };

  const onBeforeSendHeadersHandler = (
    details: OnBeforeSendHeadersListenerDetails,
    callback: (response: { requestHeaders?: Record<string, string> }) => void,
  ) => {
    if (!active) {
      callback({ requestHeaders: details.requestHeaders });
      return;
    }
    const headers = details.requestHeaders || {};
    headers["Referer"] = referer;
    headers["Origin"] = origin;
    headers["User-Agent"] = userAgent;
    callback({ requestHeaders: headers });
  };

  const onHeadersReceivedHandler = (
    details: OnHeadersReceivedListenerDetails,
    callback: (response: { responseHeaders?: Record<string, string | string[]> }) => void,
  ) => {
    if (!active) {
      callback({ responseHeaders: details.responseHeaders });
      return;
    }
    const headers = details.responseHeaders || {};
    const headerName = Object.keys(headers).find(k => k.toLowerCase() === "set-cookie");

    if (headerName) {
      const setCookieValues = headers[headerName];
      if (Array.isArray(setCookieValues)) {
        headers[headerName] = stripDomainFromSetCookie(setCookieValues);
      }
    }

    callback({ responseHeaders: headers });
  };

  sess.webRequest.onBeforeSendHeaders(filter, onBeforeSendHeadersHandler);
  sess.webRequest.onHeadersReceived(filter, onHeadersReceivedHandler);

  return {
    dispose: () => {
      active = false;
    },
  };
}
