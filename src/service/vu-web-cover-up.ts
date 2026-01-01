import { memberRequest } from "./request";

/**
 * 上传封面 - 请求参数
 * 请求方式：POST（application/x-www-form-urlencoded）
 * 认证方式：Cookie（需要 csrf）
 */
export interface VuWebCoverUpRequestParams {
  /**
   * CSRF Token（bili_jct），Cookie 方式必要
   * 一般由请求拦截器在 useCSRF=true 时自动注入
   */
  csrf?: string;
  /**
   * 封面图片，经过 base64 编码的图片数据
   * 例如：data:image/jpeg;base64,/9j/4AAQSkZJRgABA...
   */
  cover: string;
  /**
   * 当前时间的毫秒时间戳（可选）
   * 文档中作为 URL 查询参数 ts 传递
   */
  ts?: number;
}

/**
 * 上传封面 - 响应 data
 */
export interface VuWebCoverUpData {
  /** 封面 URL */
  url: string;
}

/**
 * 上传封面 - 响应类型
 */
export interface VuWebCoverUpResponse {
  /** 返回值 0: 成功 -400: 请求错误 -111: csrf 校验失败 -101: 账号未登录 */
  code: number;
  /** 错误信息，默认为 "0" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 信息本体 */
  data: VuWebCoverUpData;
}

/**
 * 上传封面
 */
export function postVuWebCoverUp(data: VuWebCoverUpRequestParams): Promise<VuWebCoverUpResponse> {
  const { ts, ...body } = data;

  return memberRequest.post<VuWebCoverUpResponse>("/x/vu/web/cover/up", body, {
    params: ts !== undefined ? { ts } : undefined,
    useFormData: true,
    useCSRF: true,
  });
}
