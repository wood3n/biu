import { UserAgent } from "./user-agent";

function extractCookieFromSetCookie(setCookies: string[] | undefined, name: string): string | null {
  if (!setCookies || setCookies.length === 0) return null;
  for (const cookieStr of setCookies) {
    const firstPart = cookieStr.split(";")[0] || "";
    const eq = firstPart.indexOf("=");
    if (eq > 0) {
      const k = firstPart.slice(0, eq).trim();
      const v = firstPart.slice(eq + 1).trim();
      if (k === name) return v;
    }
  }
  return null;
}

function getSetCookieArray(res: Response): string[] {
  // undici (Node.js fetch) supports headers.getSetCookie()
  const anyHeaders = res.headers as any;
  const setCookie =
    (anyHeaders.getSetCookie?.() as string[] | undefined) ?? (anyHeaders.raw?.()["set-cookie"] as string[] | undefined);

  if (setCookie && Array.isArray(setCookie)) return setCookie;

  const v = res.headers.get("set-cookie");
  return v ? [v] : [];
}

export async function getWebBNut() {
  const headers = new Headers({
    "User-Agent": UserAgent,
  });

  const res = await fetch("https://www.bilibili.com/", {
    method: "HEAD",
    // 手动处理 3xx，以获取每次跳转的 Set-Cookie
    redirect: "manual",
    headers,
  });

  // 解析本次响应的 Set-Cookie
  try {
    const setCookies = getSetCookieArray(res);
    const maybe = extractCookieFromSetCookie(setCookies, "b_nut");
    return maybe; // 已拿到，直接返回
  } catch {
    return "";
  }
}
