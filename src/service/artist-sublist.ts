import request from './request';

/*
 * 收藏的歌手列表
 */
export const getArtistSublist = () => request.get('/artist/sublist');
