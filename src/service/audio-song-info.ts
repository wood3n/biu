import { biliRequest } from "./request";

/**
 * 查询歌曲基本信息 - 请求参数
 * GET https://www.bilibili.com/audio/music-service-c/web/song/info
 */
export interface AudioSongInfoRequestParams {
  /** 音频auid */
  sid: number;
}

/**
 * 歌曲统计信息
 */
export interface AudioSongStatistic {
  /** 音频auid */
  sid: number;
  /** 播放次数 */
  play: number;
  /** 收藏数 */
  collect: number;
  /** 评论数 */
  comment: number;
  /** 分享数 */
  share: number;
}

/**
 * UP主会员状态
 */
export interface AudioSongVipInfo {
  /** 会员类型 0:无 1:月会员 2:年会员 */
  type: number;
  /** 会员状态 0:无 1:有 */
  status: number;
  /** 会员到期时间时间戳 毫秒 */
  due_date: number;
  /** 会员开通状态 0:无 1:有 */
  vip_pay_type: number;
}

/**
 * 查询歌曲基本信息 - 数据对象
 */
export interface AudioSongInfoData {
  /** 音频auid */
  id: number;
  /** UP主mid */
  uid: number;
  /** UP主昵称 */
  uname: string;
  /** 作者名 */
  author: string;
  /** 歌曲标题 */
  title: string;
  /** 封面图片url */
  cover: string;
  /** 歌曲简介 */
  intro: string;
  /** lrc歌词url */
  lyric: string;
  /** 1 作用尚不明确 */
  crtype: number;
  /** 歌曲时间长度 单位为秒 */
  duration: number;
  /** 歌曲发布时间 时间戳 */
  passtime: number;
  /** 当前请求时间 时间戳 */
  curtime: number;
  /** 关联稿件avid 无为0 */
  aid: number;
  /** 关联稿件bvid 无为空 */
  bvid: string;
  /** 关联视频cid 无为0 */
  cid: number;
  /** 作用尚不明确 */
  msid: number;
  /** 作用尚不明确 */
  attr: number;
  /** 作用尚不明确 */
  limit: number;
  /** 作用尚不明确 */
  activityId: number;
  /** 作用尚不明确 */
  limitdesc: string;
  /** 作用尚不明确 */
  ctime: number | null;
  /** 状态数 */
  statistic: AudioSongStatistic;
  /** UP主会员状态 */
  vipInfo: AudioSongVipInfo;
  /** 歌曲所在的收藏夹mlid 需要登录(SESSDATA) */
  collectIds: number[];
  /** 投币数 */
  coin_num: number;
}

/**
 * 查询歌曲基本信息 - 响应
 */
export interface AudioSongInfoResponse {
  /** 返回值 0：成功 72000000：参数错误 7201006：该音频不存在或已被下架 72010027：版权音乐重定向 */
  code: number;
  /** 错误信息 默认为success */
  msg: string;
  /** 信息本体 */
  data: AudioSongInfoData | null;
}

/**
 * 查询歌曲基本信息
 * @param params 请求参数
 */
export const getAudioSongInfo = (params: AudioSongInfoRequestParams) => {
  return biliRequest.get<AudioSongInfoResponse>("/audio/music-service-c/web/song/info", {
    params,
  });
};
