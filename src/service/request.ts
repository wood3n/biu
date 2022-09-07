import axios from 'axios';

/**
 * merge AxiosRequestConfig from axios
 */
declare module 'axios' {
  export interface AxiosRequestConfig {
    useTimeStamp?: boolean;
  }

  // https://github.com/axios/axios/issues/1510#issuecomment-525382535
  export interface AxiosInstance {
    request<T = any> (config: AxiosRequestConfig): Promise<T>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  }
}

/**
 * https://github.com/Binaryify/NeteaseCloudMusicApi
 * NeteaseCloudMusicApi 自带服务端跨域头配置，因此本地 server 可以不配置 proxy
 */
const request = axios.create({
  baseURL: 'https://netease-cloud-music-api-kohl-beta.vercel.app',
  timeout: 10000,
  withCredentials: true,
  params: {},
});

// 对 post 请求的 url 添加时间戳
request.interceptors.request.use(({ method, params, useTimeStamp, ...rest }) => {
  if (useTimeStamp) {
    params.timestamp = Date.now();
  }

  return {
    method,
    params,
    ...rest
  };
});

request.interceptors.response.use(res => res.data);

export default request;
