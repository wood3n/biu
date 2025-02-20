import request from "./request";

/*
 * 收藏的 MV 列表
 */
export const getMvSublist = () => request.get("/mv/sublist");
