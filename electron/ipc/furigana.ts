import { utilityProcess, type UtilityProcess } from "electron";
import log from "electron-log";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 假名注音子进程管理器。
 *
 * kuromoji 词典加载后会以 ArrayBuffer 形式常驻约 190MB 内存，且 V8 在生产环境
 * 缺乏主动 full-GC 的时机，之前主进程一旦用过注音功能即永久膨胀。
 * 现将词典运行在 utilityProcess 子进程中：
 * - 惰性 fork：首次请求注音时才启动子进程并加载词典
 * - 空闲自动退出：IDLE_TIMEOUT 内无请求则 kill 子进程，内存立即归还系统
 * - 崩溃自愈：子进程异常退出时挂起请求按“失败返回原文”语义结清
 */

/** 空闲多久后销毁子进程（词典重新加载约需数秒，10 分钟粒度下几乎无感） */
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

/** 单次转换超时：需覆盖首次词典加载耗时 */
const CONVERT_TIMEOUT_MS = 30 * 1000;

type PendingEntry = {
  resolve: (value: string) => void;
  timer: NodeJS.Timeout;
};

type WorkerMessage =
  | { type: "ready" }
  | { type: "converted"; id: number; ok: true; text: string }
  | { type: "converted"; id: number; ok: false; error: string };

let worker: UtilityProcess | null = null;
let workerReady: Promise<void> | null = null;
let seq = 0;
const pending = new Map<number, PendingEntry>();
let idleTimer: NodeJS.Timeout | null = null;

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function resetIdleTimer() {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    idleTimer = null;
    if (pending.size === 0) {
      log.info("[furigana] idle timeout, releasing dictionary worker");
      destroyFuriganaWorker();
    }
  }, IDLE_TIMEOUT_MS);
  idleTimer.unref?.();
}

function settleAllPending() {
  for (const [id, entry] of pending) {
    clearTimeout(entry.timer);
    entry.resolve("");
    pending.delete(id);
  }
}

function destroyFuriganaWorker() {
  clearIdleTimer();

  settleAllPending();
  workerReady = null;

  if (worker) {
    const dying = worker;
    worker = null;
    try {
      dying.kill();
    } catch (err) {
      log.warn("[furigana] kill worker failed:", err);
    }
  }
}

function ensureWorker(): Promise<void> {
  if (worker && worker.pid) return workerReady ?? Promise.resolve();

  workerReady ??= new Promise<void>((resolve, reject) => {
    let settled = false;

    worker = utilityProcess.fork(path.join(__dirname, "../furigana-worker.mjs"), [], {
      serviceName: "biu-furigana",
    });

    const onMessage = (msg: WorkerMessage) => {
      if (msg.type === "ready" && !settled) {
        settled = true;
        resolve();
        return;
      }

      if (msg.type === "converted") {
        const entry = pending.get(msg.id);
        if (!entry) return;

        pending.delete(msg.id);
        clearTimeout(entry.timer);
        if (msg.ok) {
          entry.resolve(msg.text);
        } else {
          // 转换失败时按既有语义返回原文
          entry.resolve("");
        }
      }
    };

    const onExit = () => {
      worker?.off("message", onMessage);
      worker?.off("exit", onExit);
      worker = null;
      workerReady = null;

      settleAllPending();

      if (!settled) {
        settled = true;
        reject(new Error("furigana worker exited before ready"));
      }
    };

    worker.on("message", onMessage);
    worker.on("exit", onExit);
  });

  return workerReady;
}

function requestConvert(text: string): Promise<string> {
  const id = ++seq;

  return new Promise<string>(resolve => {
    const timer = setTimeout(() => {
      pending.delete(id);
      log.warn(`[furigana] convert #${id} timed out after ${CONVERT_TIMEOUT_MS}ms`);
      resolve("");
    }, CONVERT_TIMEOUT_MS);
    timer.unref?.();

    pending.set(id, { resolve, timer });

    try {
      if (!worker || !worker.pid) {
        throw new Error("worker is not running");
      }
      worker.postMessage({ type: "convert", id, text } as const);
    } catch (err) {
      pending.delete(id);
      clearTimeout(timer);
      log.error("[furigana] post to worker failed:", err);
      resolve("");
    }
  });
}

/**
 * 将日文歌词文本转为带 <ruby> 注音标记的 HTML 片段。
 * @param text 原始歌词行
 * @returns 注音后的 HTML 字符串；失败时返回原文本
 */
export async function addFurigana(text: string): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) return text;

  resetIdleTimer();

  try {
    await ensureWorker();
  } catch (err) {
    log.warn("[furigana] worker not available, returning original text:", err);
    return text;
  }

  const result = await requestConvert(trimmed);
  return result || text;
}

/**
 * 批量注音：一次处理整个歌词列表，减少 IPC 往返。
 */
export async function addFuriganaBatch(texts: string[]): Promise<string[]> {
  if (!texts?.length) return texts;

  const results: string[] = new Array(texts.length);
  await Promise.all(
    texts.map(async (text, index) => {
      results[index] = await addFurigana(text);
    }),
  );
  return results;
}

export { destroyFuriganaWorker };
