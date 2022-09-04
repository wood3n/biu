import axios from 'axios';

/**
 * https://github.com/Binaryify/NeteaseCloudMusicApi
 * NeteaseCloudMusicApi 自带服务端跨域头配置，因此本地 server 可以不配置 proxy
 */
const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true
});

// 对 post 请求的 url 添加时间戳
request.interceptors.request.use(({ method, baseURL, url, ...rest }) => {
  if (method === 'post' && baseURL && url) {
    const urlObj = new URL(`${baseURL}${url}`);

    urlObj.searchParams.set('timestamp', String(Date.now()));

    url = urlObj.toString();
  }

  return {
    method,
    url,
    ...rest
  };
});

request.interceptors.response.use(res => res.data);

export default request;
