/**
 * 假名注音 utility process 端。
 *
 * kuromoji 词典加载后常驻约 190MB（磁盘 40MB 的词典展开为 220MB+ ArrayBuffer）。
 * 将其隔离到独立子进程中运行，主进程按需 fork、空闲时 kill，
 * 可让这部分内存完全即时归还操作系统，主进程不再被词典撑大。
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type KuroshiroInstance = {
  init: (analyzer: unknown) => Promise<void>;
  convert: (sentence: string, options: { to: "hiragana"; mode: "furigana" }) => Promise<string>;
};

type WorkerRequest = {
  type: "convert";
  id: number;
  text: string;
};

type WorkerResponse =
  | { type: "ready" }
  | { type: "converted"; id: number; ok: true; text: string }
  | { type: "converted"; id: number; ok: false; error: string };

// kuroshiro 及其 kuromoji 分析器是 CommonJS 模块，通过 createRequire 在 ESM worker 中加载
let kuroshiroInstance: KuroshiroInstance | null = null;
let initPromise: Promise<KuroshiroInstance> | null = null;

/**
 * 惰性初始化 kuroshiro 单例。
 *
 * 关键：必须用 initPromise 锁住初始化。歌词逐行触发 convert 请求，
 * 首次大量并发请求若各自进入初始化分支，会并发加载多份 ~370MB 词典，
 * 直接把 worker 内存撑爆（实测曾达 4.7GB）。
 * 并发调用共享同一个 initPromise，词典只加载一次。
 */
function getKuroshiro(): Promise<KuroshiroInstance> {
  if (kuroshiroInstance) return Promise.resolve(kuroshiroInstance);

  if (!initPromise) {
    initPromise = (async () => {
      const KuroshiroModule = require("kuroshiro") as any;
      const Kuroshiro = KuroshiroModule?.default ?? KuroshiroModule;

      const KuromojiModule = require("kuroshiro-analyzer-kuromoji") as any;
      const KuromojiAnalyzer = KuromojiModule?.default ?? KuromojiModule;

      const instance = new Kuroshiro();
      // 首次调用需加载词典（数 MB 数据文件），随后在子进程内复用
      await instance.init(new KuromojiAnalyzer());
      kuroshiroInstance = instance;
      return instance;
    })().catch((err: unknown) => {
      // 初始化失败允许后续请求重试
      initPromise = null;
      throw err;
    });
  }

  return initPromise;
}

const parentPort = (process as any).parentPort;

if (!parentPort) {
  // 独立调试场景：没有父进程端口时直接退出
  process.exit(1);
}

parentPort.on("message", async (event: { data: WorkerRequest }) => {
  const msg = event?.data;
  if (!msg || msg.type !== "convert") return;

  let response: WorkerResponse;
  try {
    const kuroshiro = await getKuroshiro();
    const text = await kuroshiro.convert(msg.text, { mode: "furigana", to: "hiragana" });
    response = { type: "converted", id: msg.id, ok: true, text };
  } catch (err) {
    response = {
      type: "converted",
      id: msg.id,
      ok: false,
      error: String((err as Error)?.message ?? err),
    };
  }

  parentPort.postMessage(response);
});

parentPort.postMessage({ type: "ready" } satisfies WorkerResponse);
