import request from "./request";

/*
 * 获取用户等级信息
 */
export const getUserLevel = () => request.get("/user/level");
