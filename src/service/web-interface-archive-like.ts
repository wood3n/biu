import { apiRequest } from "./request";

export interface WebInterfaceArchiveLikeRequestParams {
  aid?: number;
  bvid?: string;
  like: 1 | 2;
}

export interface WebInterfaceArchiveLikeResponse {
  code: number;
  message: string;
  ttl: number;
}

export const postWebInterfaceArchiveLike = (data: WebInterfaceArchiveLikeRequestParams) => {
  return apiRequest.post<WebInterfaceArchiveLikeResponse>("/x/web-interface/archive/like", data, {
    useCSRF: true,
    useFormData: true,
  });
};
