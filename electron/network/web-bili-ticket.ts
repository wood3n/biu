import crypto from "node:crypto";

import { UserAgent } from "./user-agent";

/**
 * BiliTicket 生成接口 - 请求参数（URL 参数）
 * POST /bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket
 * 参考: https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/bili_ticket.html
 */
export interface GenWebTicketRequestParams {
  /** 固定为 ec02 */
  key_id: string;
  /** HMAC-SHA256("ts" + timestamp) 的十六进制字符串（key: XgwSnGZ1p） */
  hexsign: string;
  /** UNIX 秒级时间戳，例如 1700000000 */
  "context[ts]": number | string;
  /** CSRF，来自 Cookie 中的 bili_jct，可为空 */
  csrf?: string;
}

/**
 * BiliTicket 生成接口 - 响应体
 */
export interface GenWebTicketResponse {
  code: number; // 0: 成功 400: 参数错误
  message: string; // 返回消息 OK: 成功
  ttl: number; // 1
  data: {
    ticket: string; // bili_ticket (JWT)
    created_at: number; // 创建时间 UNIX 秒级
    ttl: number; // 有效时长 259200 秒 (3 天)
    context: Record<string, unknown>;
    nav?: {
      img: string; // WBI img_key
      sub: string; // WBI sub_key
    };
  };
}

/**
 * 计算 HMAC-SHA256 十六进制签名
 */
function hmacSha256(message) {
  const hmac = crypto.createHmac("sha256", "XgwSnGZ1p");
  hmac.update(message);
  return hmac.digest("hex");
}

/**
 * 生成 bili_ticket (BiliTicket)
 * - 内部自动计算 hexsign 与 context[ts]
 */
export async function getBiliTicket(): Promise<string> {
  const ts = Math.floor(Date.now() / 1000);

  // 文档说明：hexsign = HMAC-SHA256(key: "XgwSnGZ1p", message: "ts" + timestamp)
  const hexsign = hmacSha256(`ts${ts}`);

  const url = "https://api.bilibili.com/bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket";
  const params = new URLSearchParams({
    key_id: "ec02",
    hexsign,
    "context[ts]": String(ts),
    csrf: "",
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    method: "POST",
    headers: {
      "User-Agent": UserAgent,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = (await response.json()) as GenWebTicketResponse;
  return data?.data?.ticket;
}
