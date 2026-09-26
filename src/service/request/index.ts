import axios, {
  type AxiosError,
  type AxiosResponse,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from "axios";

import { useBBPTokenStore } from "@/store/bbp-token";

import { requestInterceptors } from "./request-interceptors";
import { geetestInterceptors } from "./response-interceptors";

const axiosConfig: CreateAxiosDefaults = {
  timeout: 30000,
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

export const memberRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://member.bilibili.com",
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
memberRequest.interceptors.request.use(requestInterceptors);

apiRequest.interceptors.response.use(geetestInterceptors);

axiosInstance.interceptors.response.use(res => res.data);
biliRequest.interceptors.response.use(res => res.data);
apiRequest.interceptors.response.use(res => res.data);
passportRequest.interceptors.response.use(res => res.data);
searchRequest.interceptors.response.use(res => res.data);
memberRequest.interceptors.response.use(res => res.data);

/**
 * BBPlayer 自建后端请求实例
 * - JWT Bearer Token 鉴权（非 Cookie）
 * - 响应体直接返回业务 JSON，无 B 站 {code, data} 包裹
 */
export const bbpRequest = axios.create({
  ...axiosConfig,
  baseURL: "https://be.bbplayer.roitium.com",
  withCredentials: false,
});

// BBPlayer 错误码 → 用户友好提示
const bbpErrorMessages: Record<string, string> = {
  invalid_credentials: "用户名或密码不正确",
  Unauthorized: "登录已过期，请重新登录",
  "Invalid or expired token": "登录已过期，请重新登录",
  username_already_exists: "用户名已被占用",
  invalid_body: "输入信息有误，请检查",
  account_not_found: "账号不存在",
  Forbidden: "没有权限执行此操作",
  "Playlist not found": "歌单不存在",
};

// BBPlayer 请求拦截器：从 Zustand store 读取 JWT Token 并注入 Authorization 头
const bbpRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  if (!config.skipAuth) {
    const token = useBBPTokenStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
};

// BBPlayer 响应拦截器：成功直接返回 res.data，失败提取 error + summary 并翻译
const bbpResponseInterceptor = (res: AxiosResponse) => res.data;

const bbpResponseErrorInterceptor = (error: AxiosError<{ error?: string; summary?: string }>) => {
  const data = error.response?.data;
  const errorCode = data?.error || error.message;
  const friendlyMessage = bbpErrorMessages[errorCode] ?? (data?.summary ? `${errorCode}: ${data.summary}` : errorCode);

  // 401 且是 token 失效：清除本地登录状态
  if (error.response?.status === 401 && !bbpErrorMessages[errorCode]?.includes("不正确")) {
    useBBPTokenStore.getState().clear();
  }

  return Promise.reject({ ...error, message: friendlyMessage });
};

bbpRequest.interceptors.request.use(bbpRequestInterceptor);
bbpRequest.interceptors.response.use(bbpResponseInterceptor, bbpResponseErrorInterceptor);
