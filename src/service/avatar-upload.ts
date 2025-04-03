import request from "./request";

export interface AvatarUploadRequestParams {
  imgSize: number | undefined;
  imgX: number | undefined;
}

export interface AvatarUploadRequestData {
  imgFile: FormData;
}

/*
 * 更新头像
 */
export const postAvatarUpload = (data: AvatarUploadRequestData, params: AvatarUploadRequestParams) =>
  request.post("/avatar/upload", data, { params });
