import got from "got";

export function getLyricsByLrclib(params: SearchSongByLrclibParams) {
  return got
    .get("https://lrclib.net/api/search", {
      searchParams: {
        ...params,
      },
      timeout: { request: 10000 },
      retry: { limit: 3 },
    })
    .json<SearchSongByLrclibResponse[]>();
}
