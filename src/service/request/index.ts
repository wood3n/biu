import axios, { type CreateAxiosDefaults } from "axios";

import { requestInterceptors } from "./request-interceptors";
import { geetestInterceptors } from "./response-interceptors";

const axiosConfig: CreateAxiosDefaults = {
  timeout: 10000,
  withCredentials: true,
};

export const axiosInstance = axios.create(axiosConfig);

export const searchRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://s.search.bilibili.com",
});

export const biliRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://www.bilibili.com",
});

export const apiRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://api.bilibili.com",
});

export const passportRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://passport.bilibili.com",
});

apiRequest.interceptors.request.use(requestInterceptors);
passportRequest.interceptors.request.use(requestInterceptors);
searchRequest.interceptors.request.use(requestInterceptors);

apiRequest.interceptors.response.use(geetestInterceptors);

biliRequest.interceptors.response.use(res => res.data);
apiRequest.interceptors.response.use(res => res.data);
passportRequest.interceptors.response.use(res => res.data);
searchRequest.interceptors.response.use(res => res.data);
