import { apiRequest } from "./request";

export interface WebInterfaceArchiveLikeTripleRequestParams {
  aid?: number;
}

export interface WebInterfaceArchiveLikeTripleData {
  like: boolean;
  coin: boolean;
  fav: boolean;
  multiply: number;
}

export interface WebInterfaceArchiveLikeTripleResponse {
  code: number;
  message: string;
  ttl: number;
  data: WebInterfaceArchiveLikeTripleData;
}

export const postWebInterfaceArchiveLikeTriple = (data: WebInterfaceArchiveLikeTripleRequestParams) => {
  return apiRequest.post<WebInterfaceArchiveLikeTripleResponse>("/x/web-interface/archive/like/triple", data, {
    useCSRF: true,
    useFormData: true,
  });
};
