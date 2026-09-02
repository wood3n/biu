import { apiRequest } from "./request";

/**
 * 获取主评论列表 - 请求参数
 */
export interface ReplyMainRequestParams {
  oid: number; // 目标评论区id(视频为aid)
  type: number; // 评论区类型代码 1:视频 2:音频
  mode: number; // 排序模式 2:按时间 3:按热度
  next: number; // 评论页游标，首页为0，后续用响应cursor.next
  plat?: number; // 平台标识 1:web
}

/**
 * 评论者信息
 */
export interface ReplyMember {
  mid: string; // 用户mid
  uname: string; // 用户昵称
  avatar: string; // 头像url
  sex: string; // 性别 男/女/保密
  sign: string; // 个人签名
  level_info: { current_level: number }; // 当前等级
}

/**
 * 评论内容
 */
export interface ReplyContent {
  message: string; // 评论内容(含表情占位文本)
  members?: unknown[]; // @的用户信息
  emote?: Record<string, { url: string; meta: { size: number } }>; // 表情信息 key:表情占位文本
  jump_url?: Record<string, { html: string }>; // 文本跳转链接
  pictures?: { img_src: string; img_width: number; img_height: number; img_size: number }[]; // 图片评论
  max_line?: number; // 最大行数
}

/**
 * 评论项
 */
export interface ReplyItem {
  rpid: number; // 评论id
  rpid_str: string; // 评论id(字符串，防精度丢失)
  oid: number; // 目标评论区id
  mid: number; // 评论者mid
  root: number; // 根评论rpid(主评论为0)
  parent: number; // 父评论rpid
  count: number; // 回复总数
  rcount: number; // 回复数量(展示用，含楼中楼)
  state: number; // 评论状态
  ctime: number; // 发送时间(秒)
  like: number; // 点赞数
  action: number; // 操作状态 0:未点赞 1:已点赞
  member: ReplyMember; // 评论者信息
  content: ReplyContent; // 评论内容
  replies: ReplyItem[] | null; // 楼中楼预览(主列表附带前几条，可能为null)
  up_action: { like: boolean; reply: boolean }; // UP主操作
}

/**
 * 游标信息
 */
export interface ReplyCursor {
  is_begin: boolean; // 是否首页
  prev: number; // 上一页游标
  next: number; // 下一页游标
  is_end: boolean; // 是否末页
  mode: number; // 当前排序模式
  all_count: number; // 评论总数
  support_mode: number[]; // 支持的排序模式
}

/**
 * 获取主评论列表 - 响应类型
 */
export interface ReplyMainResponse {
  code: number; // 返回值 0:成功 -400:请求错误 -403:权限不足 12002:评论区已关闭
  message: string; // 错误信息
  data: {
    cursor: ReplyCursor; // 游标信息
    replies: ReplyItem[] | null; // 评论列表(无评论时为null)
    top: { upper: ReplyItem | null; admin: ReplyItem | null; vote: ReplyItem | null }; // 置顶评论
  };
}

/**
 * 获取主评论列表
 * @param params 请求参数
 * @returns Promise<ReplyMainResponse>
 */
export const getReplyMain = (params: ReplyMainRequestParams) => {
  return apiRequest.get<ReplyMainResponse>("/x/v2/reply/main", { params });
};

/**
 * 获取楼中楼列表 - 请求参数
 */
export interface ReplyReplyRequestParams {
  oid: number; // 目标评论区id(视频为aid)
  type: number; // 评论区类型代码 1:视频 2:音频
  root: number; // 根评论rpid
  ps: number; // 每页数量(建议 10/20)
  pn: number; // 页码(从1开始)
}

/**
 * 获取楼中楼列表 - 响应类型
 */
export interface ReplyReplyResponse {
  code: number; // 返回值 0:成功
  message: string; // 错误信息
  data: {
    page: { num: number; size: number; count: number }; // 分页信息 count:总回复数
    replies: ReplyItem[] | null; // 楼中楼回复列表(可能为null)
  };
}

/**
 * 获取楼中楼列表(页码分页，与主列表游标分页不同)
 * @param params 请求参数
 * @returns Promise<ReplyReplyResponse>
 */
export const getReplyReply = (params: ReplyReplyRequestParams) => {
  return apiRequest.get<ReplyReplyResponse>("/x/v2/reply/reply", { params });
};
