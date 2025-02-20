import request from "./request";

/*
 * 云盘数据详情
 */
export const getUserCloudDetail = () => request.get("/user/cloud/detail");
