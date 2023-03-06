import request from './request';

/*
 * 获取历史日推可用日期列表
 */
export const getHistoryRecommendSongs = () => request.get('/history/recommend/songs');
