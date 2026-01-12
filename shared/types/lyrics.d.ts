interface SearchSongByNeteaseParams {
  s: string;
  type: number;
  limit: number;
  offset: number;
}

interface SearchSongByNeteaseResponse {
  result?: {
    songs?: NeteaseSong[];
    hasMore?: boolean;
    songCount?: number;
  };
  code?: number;
  trp?: {
    rules?: string[];
  };
}

interface NeteaseSong {
  id?: number;
  name?: string;
  alias?: string[];
  artists?: NeteaseArtist[];
  album?: NeteaseAlbum;
  duration?: number;
  fee?: number;
  rtype?: number;
  ftype?: number;
  copyrightId?: number;
  transNames?: string[];
  mvid?: number;
  mark?: number;
  status?: number;
}

interface NeteaseAlbum {
  id?: number;
  name?: string;
  publishTime?: number;
  size?: number;
  picId?: number;
  artist?: NeteaseArtist;
  copyrightId?: number;
  alia?: string[];
  mark?: number;
  status?: number;
  transNames?: string[];
}

interface NeteaseArtist {
  id?: number;
  name?: string;
  alias?: string[];
  img1v1Url?: string;
  picId?: number;
  musicSize?: number;
  albumSize?: number;
  img1v1?: number;
}

interface GetLyricsByNeteaseParams {
  id: number;
}

interface GetLyricsByNeteaseResponse {
  sgc?: boolean;
  sfy?: boolean;
  qfy?: boolean;
  transUser?: NeteaseUser;
  lyricUser?: NeteaseUser;
  lrc?: NeteaseKlyric;
  klyric?: NeteaseKlyric;
  tlyric?: NeteaseKlyric;
  romalrc?: NeteaseKlyric;
  code?: number;
}

interface NeteaseKlyric {
  version?: number;
  lyric?: string;
}

interface NeteaseUser {
  id?: number;
  status?: number;
  demand?: number;
  userid?: number;
  nickname?: string;
  uptime?: number;
}

interface SeachSongByLrclibParams {
  q: string;
  track_name?: string;
  artist_name?: string;
  album_name?: string;
}

interface SeachSongByLrclibResponse {
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

interface LyricsPreference {
  fontSize: number;
  offsetMs: number;
  showTranslation: boolean;
}

interface LyricLine {
  time: number;
  text: string;
}

interface MusicLyrics {
  type: "mv" | "audio";
  bvid: string;
  cid: number;
  fontSize?: number;
  offset?: number;
  lyrics: string;
  tLyrics?: string;
}
