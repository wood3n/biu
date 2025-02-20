import request from "./request";

/*
 * 退出登录
 */
export const getLogout = () => request.get("/logout");
