import { session, type CookiesSetDetails } from "electron";
import log from "electron-log";

import { getBiliTicket } from "./web-bili-ticket";
import { getWebBNut } from "./web-bnut";
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
};

export async function injectBiliTicketCookie() {
  const ticket = await getBiliTicket();

  await setCookie({
    name: "bili_ticket",
    value: ticket,
    expirationDate: Math.floor(Date.now() / 1000 + 2.5 * 24 * 3600),
  });
}

export async function injectBuvidCookie() {
  const buvid = await getWebBuvid();

  const cookies = [
    {
      name: "buvid3",
      value: buvid.b_3,
    },
    {
      name: "buvid4",
      value: buvid.b_4,
    },
  ];

  await Promise.all(
    cookies.map(cookie =>
      setCookie({
        name: cookie.name,
        value: cookie.value,
        expirationDate: Math.floor(Date.now() / 1000 + 365 * 24 * 3600),
      }),
    ),
  );
}

export async function injectBnutCookie() {
  const nut = await getWebBNut();

  if (nut) {
    await setCookie({
      name: "b_nut",
      value: nut,
      expirationDate: Math.floor(Date.now() / 1000 + 365 * 24 * 3600),
    });
  }
}

export async function injectAuthCookie() {
  const results = await Promise.allSettled([injectBiliTicketCookie(), injectBuvidCookie(), injectBnutCookie()]);
  const failures = results.filter(r => r.status === "rejected");
  if (failures.length) {
    failures.forEach(f => log.warn("[cookies] inject failed:", f.reason));
  }
  try {
    await session.defaultSession.cookies.flushStore();
  } catch (err) {
    log.warn("[cookies] flushStore failed", err);
  }
}
