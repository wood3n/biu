import { ipcMain, net } from "electron";

import { channel } from "./channel";

/**
 * 请求方法类型
 */
type HttpMethod = "GET" | "POST";

/**
 * 渲染进程调用主进程的请求参数
 */
export interface HttpInvokePayload {
  url: string;
  method: HttpMethod;
  /** 查询参数（将自动编码到 URL） */
  params?: Record<string, string | number | boolean | null | undefined>;
  /** 仅允许安全头，自动过滤敏感头（如 Cookie） */
  headers?: Record<string, string>;
  /** 超时时间，单位毫秒（默认 10000ms） */
  timeout?: number;
  /** POST 请求体，默认按 JSON 发送 */
  body?: unknown;
}

/**
 * 统一的响应结构（与 axios 风格保持一致，通常只返回 data）
 */
export interface HttpResponse<T = any> {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  data: T;
}

/**
 * 构建查询字符串
 */
function buildQuery(params?: HttpInvokePayload["params"]): string {
  if (!params) return "";
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    usp.append(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

/**
 * 使用 Electron 的 net.request 发起请求
 */
async function doRequest<T = any>(payload: HttpInvokePayload): Promise<HttpResponse<T>> {
  const { url, method, params, headers, timeout = 10000, body } = payload;

  const fullURL = `${url}${buildQuery(params)}`;
  const req = net.request({ method, url: fullURL });

  // 设置安全头
  if (headers) {
    for (const [k, v] of Object.entries(headers)) {
      try {
        req.setHeader(k, v);
      } catch {
        // 忽略无效头设置
      }
    }
  }

  // 默认按 JSON 发送（POST）
  if (method === "POST") {
    req.setHeader("Content-Type", "application/json; charset=utf-8");
  }

  return await new Promise<HttpResponse<T>>((resolve, reject) => {
    let timedOut = false;
    const timer = setTimeout(
      () => {
        timedOut = true;
        req.abort();
        reject(new Error(`Request timeout after ${timeout}ms`));
      },
      Math.max(0, timeout),
    );

    req.on("error", err => {
      if (!timedOut) {
        clearTimeout(timer);
      }
      reject(err);
    });

    req.on("response", res => {
      const chunks: Buffer[] = [];
      res.on("data", chunk => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      res.on("end", () => {
        if (!timedOut) {
          clearTimeout(timer);
        }
        const raw = Buffer.concat(chunks).toString("utf-8");
        const headers: Record<string, string | string[] | undefined> = res.headers as any;
        const status = res.statusCode ?? 0;
        let data: any = raw;
        const ct = String(headers["content-type"] || "").toLowerCase();
        if (ct.includes("application/json")) {
          try {
            data = JSON.parse(raw);
          } catch {
            // 保留原始字符串
          }
        }
        if (status >= 400) {
          const err = new Error(`HTTP ${status}`);
          (err as any).status = status;
          (err as any).data = data;
          return reject(err);
        }
        resolve({ status, headers, data });
      });
    });

    // 写入 body（POST）
    if (method === "POST" && body !== undefined) {
      const ct = String(req.getHeader("Content-Type") || "").toLowerCase();
      if (ct.includes("application/json")) {
        req.write(JSON.stringify(body));
      } else {
        // 非 JSON 的情况，尝试直接写入字符串/Buffer
        const buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
        req.write(buf);
      }
    }

    req.end();
  });
}

/**
 * 注册 IPC 处理器，将 GET/POST 封装为可被渲染进程调用的方法
 */
export function registerRequestHandlers() {
  ipcMain.handle(channel.http.get, async (_event, payload: Omit<HttpInvokePayload, "method">) => {
    const res = await doRequest({ ...payload, method: "GET" });
    // 与 axios 拦截器保持一致：只返回 data
    return res.data;
  });

  ipcMain.handle(channel.http.post, async (_event, payload: Omit<HttpInvokePayload, "method">) => {
    const res = await doRequest({ ...payload, method: "POST" });
    return res.data;
  });
}
