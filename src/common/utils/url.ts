import type { PlayData } from "@/store/play-list";

export const getUrlParams = (url: string) => {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  return Object.fromEntries(urlParams.entries());
};

export const formatUrlProtocal = (url: string) => {
  if (url && !url.startsWith("http")) {
    return `https:${url}`;
  }

  return url;
};

export const getBiliVideoLink = (data: PlayData) => {
  return `https://www.bilibili.com/${data?.type === "mv" ? `video/${data?.bvid}${(data.pageIndex ?? 0) > 1 ? `?p=${data.pageIndex}` : ""}` : `audio/au${data?.sid}`}`;
};

export const openBiliVideoLink = (data: PlayData) => {
  window.electron.openExternal(getBiliVideoLink(data));
};
