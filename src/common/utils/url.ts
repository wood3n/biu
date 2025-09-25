export const getUrlParams = (url: string) => {
  const urlParams = new URLSearchParams(url.split("?")[1]);
  return Object.fromEntries(urlParams.entries());
};
