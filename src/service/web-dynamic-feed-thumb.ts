import { apiRequest } from "./request";

export interface PostDynamicFeedThumbParams {
  /** 动态 ID */
  dyn_id_str: string;
  /** 1：点赞；2：取消点赞 */
  up: number;
  spmid?: string;
}

export interface PostDynamicFeedThumbResposne {
  code: number;
  message: string;
}

export const postDynamicFeedThumb = async (data: PostDynamicFeedThumbParams) => {
  const csrfToken = await window.electron.getCookie("bili_jct");

  return apiRequest.post<PostDynamicFeedThumbResposne>("/x/dynamic/feed/dyn/thumb", data, {
    params: {
      csrf: csrfToken,
    },
  });
};
