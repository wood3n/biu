import request from "./request";

/*
 * 最近播放的视频
 */
export const getPlaylistVideoRecent = () => request.get("/playlist/video/recent");
