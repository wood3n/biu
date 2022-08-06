import axios from 'axios';

/**
 * https://github.com/Binaryify/NeteaseCloudMusicApi
 * NeteaseCloudMusicApi 自带服务端跨域头配置，因此本地 server 可以不配置 proxy
 */
const request = axios.create({
  baseURL: 'https://netease-cloud-music-api-kohl-beta.vercel.app',
  timeout: 10000,
  withCredentials: true,
});

export default request;
