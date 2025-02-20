import request from "./request";

/*
 * 推荐电台
 */
export const getPersonalizedDjprogram = () => request.get("/personalized/djprogram");
