import request from "./request";

/*
 * 推荐节目
 */
export const getPersonalizedRecommend = () => request.get("/personalized/recommend");
