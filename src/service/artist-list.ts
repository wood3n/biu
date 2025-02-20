import request from "./request";

export interface ArtistListRequestParams {
  limit: number | undefined;
  offset: number | undefined;
  type: number | undefined;
  area: number | undefined;
}

/*
 * 歌手分类列表，https://neteasecloudmusicapi.vercel.app/#/?id=%e6%ad%8c%e6%89%8b%e5%88%86%e7%b1%bb%e5%88%97%e8%a1%a8
 */
export const getArtistList = (params: ArtistListRequestParams) => request.get("/artist/list", { params });
