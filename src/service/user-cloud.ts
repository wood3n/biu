import request from "./request";

/**
 * 获取个人云盘
 */
export const getUserCloud = () => request.get("/user/cloud");
