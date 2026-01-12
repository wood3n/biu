import got from "got";

export interface SeachSongByLrclibParams {
  q: string;
  track_name?: string;
  artist_name?: string;
  album_name?: string;
}

export interface SeachSongByLrclibResponse {
  id?: number;
  name?: string;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: null | string;
  syncedLyrics?: null | string;
}

export function getLyricsByLrclib(params: SeachSongByLrclibParams) {
  return got.get("https://lrclib.net/api/search", { searchParams: params }).json<SeachSongByLrclibResponse[]>();
}
