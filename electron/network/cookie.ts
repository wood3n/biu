import { session, type CookiesSetDetails } from "electron";
import log from "electron-log";

import { getBiliTicket } from "./web-bili-ticket";
import { getWebBuvid } from "./web-buvid";

const setCookie = async (details: Partial<CookiesSetDetails>) => {
  await session.defaultSession.cookies.set({
    ...details,
    url: "https://bilibili.com/",
    domain: ".bilibili.com",
    path: "/",
    secure: true,
    sameSite: "no_restriction",
    httpOnly: false,
  });

  await session.defaultSession.cookies.flushStore();
};

/**
 * 过期时间：259260 秒，3天零1分钟
 */
export async function injectBiliTicketCookie() {
  const ticket = await getBiliTicket();

  const expirationDate = Math.floor(Date.now() / 1000 + 259260);

  await setCookie({
    name: "bili_ticket",
    value: ticket,
    expirationDate,
  });

  await setCookie({
    name: "bili_ticket_expires",
    value: String(expirationDate),
    expirationDate,
  });
}

/**
 * buvid4: 过期时间：30天
 */
export async function injectBuvidCookie() {
  const buvid = await getWebBuvid();

  await setCookie({
    name: "buvid4",
    value: buvid.b_4,
    expirationDate: Math.floor(Date.now() / 1000 + 30 * 24 * 3600),
  });
}

function setupCookieAutoRefresh() {
  session.defaultSession.cookies.on("changed", async (_event, cookie, cause, removed) => {
    if (!removed) return;
    const name = cookie.name;
    const expired = cause === "expired" || cause === "expired-overwrite";
    if (!expired) return;
    if (name === "buvid4") {
      try {
        await injectBuvidCookie();
      } catch (err) {
        log.warn("[cookies] auto refresh buvid4 failed", err);
      }
      return;
    }

    if (name === "bili_ticket" || name === "bili_ticket_expires") {
      try {
        await injectBiliTicketCookie();
      } catch (err) {
        log.warn("[cookies] auto refresh bili_ticket failed", err);
      }
    }
  });
}

export async function injectAuthCookie() {
  setupCookieAutoRefresh();
  const results = await Promise.allSettled([injectBiliTicketCookie(), injectBuvidCookie()]);
  const failures = results.filter(r => r.status === "rejected");
  if (failures.length) {
    failures.forEach(f => log.warn("[cookies] inject failed:", f.reason));
  }
}
