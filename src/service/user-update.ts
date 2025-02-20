import request from "./request";

export interface UserUpdateRequestParams {
  gender: number | undefined;
  birthday: number | undefined;
  nickname: string | undefined;
  province: string | undefined;
  city: string | undefined;
  signature: string | undefined;
}

/*
 * 更新用户信息
 */
export const getUserUpdate = (params: UserUpdateRequestParams) => request.get("/user/update", { params });
