import request from "./request";

export interface UserAudioRequestParams {
  uid: number | undefined;
}

/*
 * 传入用户 id 可获取用户创建的电台
 */
export const getUserAudio = (params: UserAudioRequestParams) => request.get("/user/audio", { params });
