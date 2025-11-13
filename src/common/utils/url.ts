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
