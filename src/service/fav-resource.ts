import { apiRequest } from "./request";

/**
 * 获取收藏夹内容明细列表 - 请求参数
 */
export interface FavResourceListRequestParams {
  media_id: string; // 目标收藏夹mlid(完整id)
  tid?: number; // 分区tid 默认为全部分区 0:全部分区
  keyword?: string; // 搜索关键字
  order?: string; // 排序方式 按收藏时间:mtime 按播放量:view 按投稿时间:pubtime
  type?: number; // 查询范围 0:当前收藏夹(对应media_id) 1:全部收藏夹
  ps: number; // 每页数量 定义域:1-20
  pn?: number; // 页码 默认为1
  platform?: string; // 平台标识 可为web(影响内容列表类型)
}

/**
 * 获取收藏夹内容明细列表 - 响应类型
 */
export interface FavResourceListResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -403:访问权限不足
  message: string; // 错误信息
  ttl: number; // 1
  data: FavResourceListData;
}

/**
 * 获取收藏夹内容明细列表 - 数据类型
 */
export interface FavResourceListData {
  info: FavInfo; // 收藏夹元数据
  medias: FavMedia[]; // 收藏夹内容
  has_more: boolean; // 收藏夹是否有下一页
  ttl: number; // 接口返回时间 时间戳
}

/**
 * 收藏夹元数据
 */
export interface FavInfo {
  id: number; // 收藏夹mlid(完整id) 收藏夹原始id+创建者mid尾号2位
  fid: number; // 收藏夹原始id
  mid: number; // 创建者mid
  attr: number; // 属性 0:正常 1:失效
  title: string; // 收藏夹标题
  cover: string; // 收藏夹封面图片url
  upper: FavUpper; // 创建者信息
  cover_type: number; // 封面图类别
  cnt_info: FavCntInfo; // 收藏夹状态数
  type: number; // 类型 一般是11
  intro: string; // 备注
  ctime: number; // 创建时间 时间戳
  mtime: number; // 收藏时间 时间戳
  state: number; // 状态 一般为0
  fav_state: number; // 收藏夹收藏状态 已收藏收藏夹:1 未收藏收藏夹:0
  like_state: number; // 点赞状态 已点赞:1 未点赞:0
  media_count: number; // 收藏夹内容数量
}

/**
 * 创建者信息
 */
export interface FavUpper {
  mid: number; // 创建者mid
  name: string; // 创建者昵称
  face: string; // 创建者头像url
  followed: boolean; // 是否已关注创建者
  vip_type: number; // 会员类别 0:无 1:月大会员 2:年度及以上大会员
  vip_statue: number; // 会员开通状态 0:无 1:有
}

/**
 * 收藏夹状态数
 */
export interface FavCntInfo {
  collect: number; // 收藏数
  play: number; // 播放数
  thumb_up: number; // 点赞数
  share: number; // 分享数
}

/**
 * 收藏内容
 */
export interface FavMedia {
  id: number; // 内容id 视频稿件:视频稿件avid 音频:音频auid 视频合集:视频合集id
  /** 内容类型 2:视频稿件 12:音频 21:视频合集 */
  type: number;
  title: string; // 标题
  cover: string; // 封面url
  intro: string; // 简介
  page: number; // 视频分P数
  duration: number; // 音频/视频时长
  upper: FavMediaUpper; // UP主信息
  /** 失效 0:正常 9:up自己删除 1:其他原因删除 */
  attr: number;
  cnt_info: FavMediaCntInfo; // 状态数
  link: string; // 跳转uri
  ctime: number; // 投稿时间 时间戳
  pubtime: number; // 发布时间 时间戳
  fav_time: number; // 收藏时间 时间戳
  bv_id: string; // 视频稿件bvid
  bvid: string; // 视频稿件bvid
  season: null; // (?)
}

/**
 * UP主信息
 */
export interface FavMediaUpper {
  mid: number; // UP主mid
  name: string; // UP主昵称
  face: string; // UP主头像url
}

/**
 * 状态数
 */
export interface FavMediaCntInfo {
  collect: number; // 收藏数
  play: number; // 播放数
  danmaku: number; // 弹幕数
}

/**
 * 获取收藏夹全部内容id - 请求参数
 */
export interface FavResourceIdsRequestParams {
  media_id: number; // 目标收藏夹mlid(完整id)
  platform?: string; // 平台标识 可为web(影响内容列表类型)
}

/**
 * 获取收藏夹全部内容id - 响应类型
 */
export interface FavResourceIdsResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -403:访问权限不足
  message: string; // 错误信息
  ttl: number; // 1
  data: FavResourceId[];
}

/**
 * 收藏内容id
 */
export interface FavResourceId {
  id: number; // 内容id 视频稿件:视频稿件avid 音频:音频auid 视频合集:视频合集id
  type: number; // 内容类型 2:视频稿件 12:音频 21:视频合集
  bv_id: string; // 视频稿件bvid
  bvid: string; // 视频稿件bvid
}

/**
 * 获取收藏夹内容明细列表
 * @param params 请求参数
 * @returns Promise<FavResourceListResponse>
 */
export const getFavResourceList = async (params: FavResourceListRequestParams): Promise<FavResourceListResponse> => {
  return apiRequest.get<FavResourceListResponse>("/x/v3/fav/resource/list", { params });
};

/**
 * 获取收藏夹全部内容id
 * @param params 请求参数
 * @returns Promise<FavResourceIdsResponse>
 */
export const getFavResourceIds = (params: FavResourceIdsRequestParams) => {
  return apiRequest.get<FavResourceIdsResponse>("/x/v3/fav/resource/ids", { params });
};
