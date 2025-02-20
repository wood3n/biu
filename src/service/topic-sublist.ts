import request from "./request";

export interface TopicSublistRequestParams {
  limit: number | undefined;
  offset: number | undefined;
}

/*
 * 收藏的专栏
 */
export const getTopicSublist = (params: TopicSublistRequestParams) => request.get("/topic/sublist", { params });
