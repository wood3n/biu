import request from './request';

/*
 * 获取每日推荐歌单
 */
export const getRecommendResource = () => request.get('/recommend/resource');
