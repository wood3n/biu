import axios, { CreateAxiosDefaults } from "axios";

import { requestInterceptors } from "./request-interceptors";

const axiosConfig: CreateAxiosDefaults = {
  timeout: 10000,
  withCredentials: true,
};

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

apiRequest.interceptors.response.use(res => res.data);
passportRequest.interceptors.response.use(res => res.data);
