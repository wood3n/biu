import axios from "axios";

/**
 * 生成 Web bili_ticket - 请求参数
 * POST /bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket
 * 说明：hexsign 使用 HMAC-SHA256(key="XgwSnGZ1p", message=`ts${timestamp}`) 的十六进制字符串
 * 其他：csrf 可为空；Referer 可为空或 .bilibili.com 子域
 */
export interface GenWebTicketRequestParams {
  /** 固定为 ec02 */
  key_id: "ec02";
  /** HMAC-SHA256 十六进制签名（message: "ts" + timestamp） */
  hexsign: string;
  /** UNIX 秒级时间戳（作为 context[ts]） */
  ["context[ts]"]: number;
  /** Cookie 中的 bili_jct，可选 */
  csrf?: string;
}

/** nav 信息（用于 WBI 签名相关） */
export interface GenWebTicketNav {
  /** img_key 值 */
  img: string;
  /** sub_key 值 */
  sub: string;
}

/** data 本体 */
export interface GenWebTicketData {
  /** 生成的 bili_ticket（JWT） */
  ticket: string;
  /** 创建时间（UNIX 秒） */
  created_at: number;
  /** 有效时长（秒），一般为 259200（3 天） */
  ttl: number;
  /** 上下文（保留扩展） */
  context: Record<string, unknown>;
  /** WBI 相关的 img/sub */
  nav: GenWebTicketNav;
}

/** 顶层响应 */
export interface GenWebTicketResponse {
  /** 返回值：0 成功；400 参数错误 */
  code: number;
  /** 返回消息，如 "OK" */
  message: string;
  /** 固定为 1 */
  ttl: number;
  /** 数据本体 */
  data: GenWebTicketData;
}

/**
 * 生成 Web bili_ticket
 * POST /bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket
 */
export function postGenWebTicket(params: GenWebTicketRequestParams): Promise<GenWebTicketResponse> {
  return axios.post<GenWebTicketResponse>(
    "https://api.bilibili.com/bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket",
    null,
    { params },
  );
}
