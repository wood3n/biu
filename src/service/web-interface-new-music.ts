import { apiRequest } from "./request";

export interface NewMusicResponse {
  code?: number;
  message?: string;
  ttl?: number;
  data?: Data;
}

export interface Data {
  list?: List[];
}

export interface List {
  id?: number;
  music_id?: string;
  music_title?: string;
  music_corner?: string;
  publish_time?: string;
  jump_url?: string;
  priority?: number;
  rank?: number;
  wish_listen?: boolean;
  wish_count?: number;
  cover?: string;
  author?: string;
  album?: string;
  aid?: string;
  cid?: string;
  bvid?: string;
  total_vv?: number;
}

export const getNewMusic = async () => {
  return apiRequest.get<NewMusicResponse>("/x/centralization/interface/new/music", {
    params: {
      plat: 2,
      web_location: "333.1351",
    },
    useCSRF: true,
  });
};
