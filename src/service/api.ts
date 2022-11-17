import request from './request';

/**
 * 发送验证码
 */
export const sendCaptcha = (phone: string) => request.get<API.BaseRes>('/captcha/sent', {
  params: {
    phone
  }
});

/**
 * 登录
 */
export const login = (data: API.PhoneLoginData) => request.post<API.PhoneLoginData>('/login/cellphone', data);

/**
 * 退出登录
 */
export const logout = () => request.get('/logout');

/**
 * 生成二维码key
 */
export const createQrKey = () => request.get<API.QrLoginkey>('/login/qr/key', { useTimeStamp: true });

/**
 * 生成二维码 base64 编码
 */
export const createQrCode = (key: string) => request.get<API.QrLoginImg>('/login/qr/create', {
  useTimeStamp: true,
  params: {
    key,
    qrimg: true
  }
});

/**
 * 二维码登录状态检测
 * 800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功(803 状态码下会返回 cookies)
 * 成功登录会写入 cookie
 */
export const loginByQr = (key: string) => request.get<API.QrLoginRes>('/login/qr/check', {
  useTimeStamp: true,
  params: {
    key
  }
});

/**
 * 获取登录状态，返回 account, profile
 */
export const getLoginStatus = (cookie?: string) => request.post<APIResponseNestData<API.UserStatus>>('/login/status', {
  cookie
}, {
  useTimeStamp: true,
});

/**
 * 获取用户 account, profile
 */
export const getUserAccount = () => request.get<APIResponse<API.UserStatus>>('/user/account');

/**
 * 获取用户详情
 */
export const getUserProfile = (uid: number) => request.get<API.UserDetail>('/user/detail', {
  params: {
    uid
  }
});

/**
 * 获取每日推荐歌曲
 */
export const getDailySongs = () => request.get<APIResponseNestData<API.DayRecommendData>>('/recommend/songs');

/**
 * 私人 FM（3首）
 */
export const getPersonalFM = () => request.get<APIResponseNestData<API.PersonalFMSong[]>>('/personal_fm', {
  params: {
    timestamp: Date.now()
  }
});