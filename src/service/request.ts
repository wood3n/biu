import axios from 'axios';

/**
 * https://github.com/Binaryify/NeteaseCloudMusicApi
 * NeteaseCloudMusicApi 自带服务端跨域头配置，因此本地 server 可以不配置 proxy
 */
const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
  params: {},
});

// 对 post 请求的 url 添加时间戳
request.interceptors.request.use(({
  method, params, ...rest
}) => ({
  method,
  params: {
    ...params,
    timestamp: Date.now(),
  },
  ...rest,
}));

request.interceptors.response.use((res) => res.data);

export default request;
