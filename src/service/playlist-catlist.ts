import request from "./request";

/*
 * 歌单分类
 */
export const getPlaylistCatlist = () => request.get("/playlist/catlist");
