import axios from 'axios';

/**
 * https://github.com/Binaryify/NeteaseCloudMusicApi
 * NeteaseCloudMusicApi 自带服务端跨域头配置，因此本地 server 可以不配置 proxy
 */
const request = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://netease-cloud-music-api-kohl-beta.vercel.app',
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
