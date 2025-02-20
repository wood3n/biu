import request from "./request";

/*
 * 获取历史日推详情数据
 */
export const getHistoryRecommendSongsDetail = () => request.get("/history/recommend/songs/detail");
