import request from "./request";

export interface cloudRequestData {
  songFile: FormData;
}

/*
 * 云盘上传
 */
export const postcloud = (data: cloudRequestData) => request.post("/cloud", data);
