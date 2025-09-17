import { apiRequest } from "./request";

/**
 * 获取音频榜单每期列表 - 请求参数
 */
export interface AudioRankAllPeriodRequestParams {
  list_type: number; // 榜单类型 1:热榜 2:原创榜
  csrf?: string; // CSRF Token(位于cookie)
}

/**
 * 获取音频榜单每期列表 - 响应类型
 */
export interface AudioRankAllPeriodResponse {
  code: number; // 返回值 0:成功 -400:请求错误
  message: string; // 错误信息
  ttl: number; // 1
  data: AudioRankAllPeriodData;
}

/**
 * 获取音频榜单每期列表 - 数据类型
 */
export interface AudioRankAllPeriodData {
  list: Record<string, AudioRankPeriodItem[]>; // 年份索引，key为年份，value为对应年份的期数数组
}

/**
 * 音频榜单期数项
 */
export interface AudioRankPeriodItem {
  ID: number; // 榜单id
  priod: number; // 榜单期数
  publish_time: number; // 发布时间，秒时间戳
}

/**
 * 查询音频榜单单期信息 - 请求参数
 */
export interface AudioRankDetailRequestParams {
  list_id: number | string; // 榜单id，见获取音频榜单每期列表
  csrf?: string; // CSRF Token(位于cookie)
}

/**
 * 查询音频榜单单期信息 - 响应类型
 */
export interface AudioRankDetailResponse {
  code: number; // 返回值 0:成功 -400:请求错误
  message: string; // 错误信息
  ttl: number; // 1
  data: AudioRankDetailData;
}

/**
 * 查询音频榜单单期信息 - 数据类型
 */
export interface AudioRankDetailData {
  listen_fid: number; // 畅听版歌单收藏夹原始id，非真实收藏夹mlid需要在后方拼接用户mid的后两位
  all_fid: number; // 完整版歌单收藏夹原始id，非真实收藏夹mlid算法同上
  fav_mid: number; // 绑定收藏夹用户的mid
  cover_url: string; // 榜单封面url
  is_subscribe: boolean; // 是否已订阅榜单 true:已订阅 false:未订阅
  listen_count: number; // 平台有版权音频的数量
}

/**
 * 获取音频榜单单期内容 - 请求参数
 */
export interface AudioRankMusicListRequestParams {
  list_id: number | string; // 榜单id，见获取音频榜单每期列表
  csrf?: string; // CSRF Token(位于cookie)
}

/**
 * 获取音频榜单单期内容 - 响应类型
 */
export interface AudioRankMusicListResponse {
  code: number; // 返回值 0:成功 -400:请求错误
  message: string; // 错误信息
  ttl: number; // 1
  data: AudioRankMusicListData;
}

/**
 * 获取音频榜单单期内容 - 数据类型
 */
export interface AudioRankMusicListData {
  list: AudioRankMusicItem[]; // 内容列表
}

/**
 * 音频榜单内容项
 */
export interface AudioRankMusicItem {
  music_id: string; // 音频MAID，例如MA409252256362326366
  music_title: string; // 音频标题
  singer: string; // 音频作者
  album: string; // 音频专辑
  mv_aid: number; // 音频MV的avid，若该音频无MV则该字段为0
  mv_bvid: string; // 音频MV的bvid
  mv_cover: string; // 音频封面url
  heat: number; // 热度值
  rank: number; // 排序值，1为最高排序，DESC方式
  can_listen: boolean; // 平台是否有版权 true:平台有版权 false:平台无版权
  recommendation: string; // 未知
  creation_aid: number; // 关联稿件avid
  creation_bvid: string; // 关联稿件bvid
  creation_cover: string; // 关联稿件封面url
  creation_title: string; // 关联稿件标题
  creation_up: number; // 关联稿件UP主mid
  creation_nickname: string; // 关联稿件UP主昵称
  creation_duration: number; // 关联稿件时长，单位为秒
  creation_play: number; // 关联稿件播放量
  creation_reason: string; // 关联稿件二级分区名
  achievements: string[]; // 获得成就
  material_id: number; // 未知
  material_use_num: number; // 未知
  material_duration: number; // 未知
  material_show: number; // 未知
  song_type: number; // 未知
}

/**
 * 订阅或退订榜单 - 请求参数
 */
export interface AudioRankSubscribeUpdateRequestParams {
  state: number; // 操作代码 1:订阅 2:退订
  list_id: number; // 榜单id，见获取音频榜单每期列表
  csrf: string; // CSRF Token(位于cookie)
}

/**
 * 订阅或退订榜单 - 响应类型
 */
export interface AudioRankSubscribeUpdateResponse {
  code: number; // 返回值 0:成功 -101:账号未登录 -111:csrf验证失败 400:请求错误
  message: string; // 错误信息
  ttl: number; // 1
}

/**
 * 获取音频榜单每期列表
 * @param params 请求参数
 * @returns Promise<AudioRankAllPeriodResponse>
 */
export const getAudioRankAllPeriod = (params: AudioRankAllPeriodRequestParams) => {
  return apiRequest.get<AudioRankAllPeriodResponse>("/x/copyright-music-publicity/toplist/all_period", { params });
};

/**
 * 查询音频榜单单期信息
 * @param params 请求参数
 * @returns Promise<AudioRankDetailResponse>
 */
export const getAudioRankDetail = (params: AudioRankDetailRequestParams) => {
  return apiRequest.get<AudioRankDetailResponse>("/x/copyright-music-publicity/toplist/detail", { params });
};

/**
 * 获取音频榜单单期内容
 * @param params 请求参数
 * @returns Promise<AudioRankMusicListResponse>
 */
export const getAudioRankMusicList = (params: AudioRankMusicListRequestParams) => {
  return apiRequest.get<AudioRankMusicListResponse>("/x/copyright-music-publicity/toplist/music_list", { params });
};

/**
 * 订阅或退订榜单
 * @param params 请求参数
 * @returns Promise<AudioRankSubscribeUpdateResponse>
 */
export const updateAudioRankSubscribe = (params: AudioRankSubscribeUpdateRequestParams) => {
  return apiRequest.post<AudioRankSubscribeUpdateResponse>(
    "/x/copyright-music-publicity/toplist/subscribe/update",
    params,
  );
};
