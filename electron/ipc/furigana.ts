import log from "electron-log";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// kuroshiro 及其 kuromoji 分析器是 CommonJS 模块，通过 createRequire 在 ESM 主进程中加载
type KuroshiroInstance = {
  init: (analyzer: unknown) => Promise<void>;
  convert: (sentence: string, options: { to: "hiragana"; mode: "furigana" }) => Promise<string>;
};

type AnalyzerConstructor = new (options?: any) => unknown;

let kuroshiroInstance: KuroshiroInstance | null = null;
let initPromise: Promise<KuroshiroInstance> | null = null;

function loadDeps() {
  const KuroshiroModule = require("kuroshiro") as any;
  const Kuroshiro = KuroshiroModule?.default ?? KuroshiroModule;

  const KuromojiModule = require("kuroshiro-analyzer-kuromoji") as any;
  const KuromojiAnalyzer = KuromojiModule?.default ?? KuromojiModule;
  return { Kuroshiro, KuromojiAnalyzer } as unknown as {
    Kuroshiro: new () => KuroshiroInstance;
    KuromojiAnalyzer: AnalyzerConstructor;
  };
}

/**
 * 惰性初始化 kuroshiro 单例。kuromoji 首次加载词典较慢（数 MB 数据文件），
 * 但之后可复用。并发调用共享同一个 initPromise。
 */
export function getKuroshiro(): Promise<KuroshiroInstance> {
  if (kuroshiroInstance) return Promise.resolve(kuroshiroInstance);

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const { Kuroshiro, KuromojiAnalyzer } = loadDeps();
        const instance = new Kuroshiro();
        await instance.init(new KuromojiAnalyzer());
        kuroshiroInstance = instance;
        return instance;
      } catch (err) {
        initPromise = null; // 允许重试
        throw err;
      }
    })();
  }

  return initPromise;
}

/**
 * 将日文歌词文本转为带 <ruby> 注音标记的 HTML 片段。
 * @param text 原始歌词行
 * @returns 注音后的 HTML 字符串；失败时返回原文本
 */
export async function addFurigana(text: string): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) return text;

  try {
    const kuroshiro = await getKuroshiro();
    return await kuroshiro.convert(trimmed, { mode: "furigana", to: "hiragana" });
  } catch (err) {
    log.warn("[furigana] 注音失败，返回原文:", err);
    return text;
  }
}

/**
 * 批量注音：一次处理整个歌词列表，减少 IPC 往返。
 */
export async function addFuriganaBatch(texts: string[]): Promise<string[]> {
  if (!texts?.length) return texts;
  // 并发受控地处理，避免单行卡住整个队列
  const results: string[] = new Array(texts.length);
  await Promise.all(
    texts.map(async (text, index) => {
      results[index] = await addFurigana(text);
    }),
  );
  return results;
}
