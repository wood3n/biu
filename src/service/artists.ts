import request from "./request";

export interface artistsRequestParams {
  id: number | undefined;
}

/*
 * 获得歌手部分信息和热门歌曲
 */
export const getartists = (params: artistsRequestParams) => request.get("/artists", { params });
