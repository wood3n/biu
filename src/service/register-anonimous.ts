import request from './request';

/*
 * 游客登录
 */
export const getRegisterAnonimous = () => request.get('/register/anonimous');
