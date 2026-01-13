export const getUrlParams = (url: string) => {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  return Object.fromEntries(urlParams.entries());
};

export const formatUrlProtocol = (url?: string) => {
  if (url && !url.startsWith("http")) {
    return `https:${url}`;
  }

  return url;
};

export const getBiliVideoLink = (data: {
  type: "mv" | "audio";
  bvid?: string;
  sid?: string | number;
  pageIndex?: number;
}) => {
  return `https://www.bilibili.com/${data?.type === "mv" ? `video/${data?.bvid}${(data.pageIndex ?? 0) > 1 ? `?p=${data.pageIndex}` : ""}` : `audio/au${data?.sid}`}`;
};

export const openBiliVideoLink = (data: {
  type: "mv" | "audio";
  bvid?: string;
  sid?: string | number;
  pageIndex?: number;
}) => {
  window.electron.openExternal(getBiliVideoLink(data));
};
