import axios, { CreateAxiosDefaults } from "axios";

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

apiRequest.interceptors.response.use(res => res.data);
passportRequest.interceptors.response.use(res => res.data);
