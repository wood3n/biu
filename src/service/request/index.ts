import axios, { type CreateAxiosDefaults } from "axios";

import { requestInterceptors } from "./request-interceptors";

const axiosConfig: CreateAxiosDefaults = {
  timeout: 10000,
  withCredentials: true,
};

export const searchRequest = axios.create({
  ...axiosConfig,
  baseURL: process.env.NODE_ENV === "development" ? "/ssearch" : "https://s.search.bilibili.com",
});

export const biliRequest = axios.create({
  ...axiosConfig,
  baseURL: process.env.NODE_ENV === "development" ? "/bili" : "https://www.bilibili.com",
});

export const apiRequest = axios.create({
  ...axiosConfig,
  baseURL: process.env.NODE_ENV === "development" ? "/api" : "https://api.bilibili.com",
});

export const passportRequest = axios.create({
  ...axiosConfig,
  baseURL: process.env.NODE_ENV === "development" ? "/auth" : "https://passport.bilibili.com",
});

apiRequest.interceptors.request.use(requestInterceptors);
passportRequest.interceptors.request.use(requestInterceptors);
searchRequest.interceptors.request.use(requestInterceptors);

biliRequest.interceptors.response.use(res => res.data);
apiRequest.interceptors.response.use(res => res.data);
passportRequest.interceptors.response.use(res => res.data);
searchRequest.interceptors.response.use(res => res.data);
