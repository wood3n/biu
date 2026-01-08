import { omitBy } from "es-toolkit/object";

import { apiRequest } from "./request";

/**
 * 开始观看视频（web端）- URL 参数
 */
export interface ClickInterfaceClickWebH5UrlParams {
  /** 稿件 aid */
  w_aid?: number;
  /** 视频分 P 编号 */
  w_part?: number;
  /** 点击时间戳（UNIX 秒级） */
  w_ftime?: number;
  /** 开始播放时间戳（UNIX 秒级） */
  w_stime?: number;
  /** 视频类型，参考心跳接口 */
  w_type?: number;
  /** 网页位置编码 */
  web_location?: number;
  /** WBI 签名，useWbi 模式下无需手动填充 */
  w_rid?: string;
  /** UNIX 秒级时间戳，useWbi 模式下无需手动填充 */
  wts?: number;
}

/**
 * 开始观看视频（web端）- 表单参数
 */
export interface ClickInterfaceClickWebH5RequestBody {
  /** 当前用户 mid */
  mid?: number;
  /** 稿件 aid */
  aid: number;
  /** 视频 cid */
  cid?: number;
  /** 视频分 P 编号 */
  part?: number;
  /** 当前用户等级 */
  lv?: number;
  /** 对应 URL 中 w_ 前缀的同名参数 */
  ftime?: number;
  /** 对应 URL 中 w_ 前缀的同名参数 */
  stime?: number;
  /** 视频类型，参考心跳接口 */
  type?: number;
  /** 视频子类型，参考心跳接口 */
  sub_type?: number;
  /** 与请求头 Referer 相同的地址 */
  referer_url?: string;
  /** 0 */
  outer?: number;
  /** 333.788.0.0 */
  spmid?: string;
  /** 播放来源，参考心跳接口 */
  from_spmid?: string;
  /** 会话信息，一串无分隔小写 UUID */
  session?: string;
  /** 平台标识，如 web */
  platform?: string;
  /** CSRF Token（即 Cookie 中 bili_jct） */
  csrf?: string;
}

/**
 * 开始观看视频（web端）- 响应
 */
export interface ClickInterfaceClickWebH5Response {
  /** 返回值 0：成功 -400：请求错误 */
  code: number;
  /** 错误信息，默认为 0 */
  message: string;
  /** 固定为 1 */
  ttl: number;
}

/**
 * 开始观看视频（web端）
 */
export function postClickInterfaceClickWebH5(
  data: ClickInterfaceClickWebH5RequestBody,
  params?: ClickInterfaceClickWebH5UrlParams,
): Promise<ClickInterfaceClickWebH5Response> {
  return apiRequest.post<ClickInterfaceClickWebH5Response>(
    "/x/click-interface/click/web/h5",
    omitBy(data, value => value === undefined || value === null || value === ""),
    {
      params,
      useFormData: true,
      useCSRF: true,
      useWbi: true,
    },
  );
}
