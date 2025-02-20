import request from "./request";

export interface UserCloudDelRequestData {
  id: number[] | undefined;
}

/*
 * 云盘歌曲删除
 */
export const postUserCloudDel = (data: UserCloudDelRequestData) => request.post("/user/cloud/del", data);
