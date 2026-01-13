import got from "got";

export function getSongByNetease(params: SearchSongByNeteaseParams) {
  return got
    .get("https://interface.music.163.com/api/search/get", {
      searchParams: {
        ...params,
      },
      timeout: { request: 10000 },
      retry: { limit: 3 },
    })
    .json<SearchSongByNeteaseResponse>();
}

export function getLyricsByNetease(params: GetLyricsByNeteaseParams) {
  return got
    .get("https://interface.music.163.com/api/song/lyric", {
      searchParams: {
        ...params,
        tv: -1,
        lv: -1,
        rv: -1,
        kv: -1,
        _nmclfl: 1,
      },
      timeout: { request: 10000 },
      retry: { limit: 3 },
    })
    .json<GetLyricsByNeteaseResponse>();
}
