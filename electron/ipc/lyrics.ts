import { ipcMain } from "electron";
import log from "electron-log";
import got from "got";

import { appSettingsStore, lyricsCacheStore, storeKey } from "../store";
import { channel } from "./channel";

type SearchLyricsParams = {
  urlTemplate: string;
  title?: string;
  artist?: string;
};

type ResolveTitleParams = {
  cacheKey: string;
  urlTemplate: string;
  title?: string;
  artist?: string;
};

type ResolveTitleArkParams = {
  cacheKey: string;
  title?: string;
  artist?: string;
};

type SearchNeteaseParams = {
  title?: string;
  artist?: string;
  searchUrlTemplate?: string;
  lyricUrlTemplate?: string;
};

function buildUrl({ urlTemplate, title, artist }: SearchLyricsParams) {
  const safeTitle = title ?? "";
  const safeArtist = artist ?? "";
  const query = [safeTitle, safeArtist].filter(Boolean).join(" ").trim();

  return urlTemplate
    .replaceAll("{title}", encodeURIComponent(safeTitle))
    .replaceAll("{artist}", encodeURIComponent(safeArtist))
    .replaceAll("{query}", encodeURIComponent(query));
}

function buildUrlFromParts(params: { urlTemplate: string; title?: string; artist?: string }) {
  return buildUrl({ urlTemplate: params.urlTemplate, title: params.title, artist: params.artist });
}

function pickFirstNonEmptyLine(text: string) {
  return (
    text
      .split(/\r?\n/)
      .map(l => l.trim())
      .find(Boolean) ?? ""
  );
}

function extractTitleText(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json: any = JSON.parse(trimmed);
      const candidates = [
        json?.title,
        json?.song,
        json?.songName,
        json?.name,
        json?.data?.title,
        json?.data?.song,
        json?.data?.songName,
        json?.data?.name,
      ];
      const hit = candidates.find(v => typeof v === "string" && v.trim().length > 0);
      if (typeof hit === "string") return hit;
    } catch {
      // Fall through to plain text.
    }
  }

  return pickFirstNonEmptyLine(raw);
}

function extractFirstJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function extractArkTitle(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const obj = extractFirstJsonObject(trimmed) as any;
  if (obj && typeof obj === "object") {
    const candidates = [obj?.title, obj?.songName, obj?.name];
    const hit = candidates.find(v => typeof v === "string" && v.trim().length > 0);
    if (typeof hit === "string") return hit;
  }

  return extractTitleText(trimmed);
}

function extractArkMeta(raw: string): { title: string; artist?: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { title: "" };

  const obj = extractFirstJsonObject(trimmed) as any;
  if (obj && typeof obj === "object") {
    const titleCandidates = [obj?.title, obj?.songName, obj?.name];
    const titleHit = titleCandidates.find(v => typeof v === "string" && v.trim().length > 0) as string | undefined;

    const artistCandidates = [obj?.artist, obj?.singer, obj?.artistName];
    const artistHit = artistCandidates.find(v => typeof v === "string" && v.trim().length > 0) as string | undefined;

    return { title: (titleHit ?? "").trim(), artist: artistHit?.trim() };
  }

  return { title: extractArkTitle(trimmed).trim() };
}

async function resolveSongMetaViaArk(params: { title?: string; artist?: string }) {
  const settings = appSettingsStore.get(storeKey.appSettings);
  const apiKey = settings?.lyricsArkApiKey?.trim();
  const endpoint = settings?.lyricsArkEndpoint?.trim() || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
  const model = settings?.lyricsArkModel?.trim() || "doubao-seed-1-6-251015";
  const reasoningEffort = settings?.lyricsArkReasoningEffort?.trim() || "medium";

  if (!apiKey) {
    log.warn("[lyrics] Ark API key is not set in settings; skip title resolving");
    return null;
  }

  const safeTitle = params?.title?.trim() ?? "";
  const safeArtist = params?.artist?.trim() ?? "";
  if (!safeTitle) return null;

  const userText = [
    "请把下面的“标题/作者”纠正为最可能的标准歌曲名与歌手名（用于在音乐平台搜索歌词）。",
    "要求：",
    "1) 去掉无关前缀/后缀：如“【LIVE】”“(完整版)”“4K”“MV”“现场”“feat.”等；",
    "2) title 只返回歌曲本体名称（不要包含歌手、专辑、版本信息）；",
    "3) artist 返回最可能的标准歌手名（可为空字符串）；",
    "4) 不确定时：title 返回原标题中最像歌名的部分，artist 保留输入作者或留空；",
    "5) 只输出严格 JSON，不要输出多余文字。",
    "",
    `标题: ${safeTitle}`,
    `作者: ${safeArtist || "未知"}`,
    "",
    '输出格式：{"title":"...","artist":"..."}',
  ].join("\n");

  const body = await got(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    json: {
      model,
      max_completion_tokens: 256,
      reasoning_effort: reasoningEffort,
      messages: [
        {
          role: "system",
          content: "你是一个音乐元数据清洗助手，擅长把视频标题纠正为标准歌曲名。",
        },
        { role: "user", content: userText },
      ],
    },
    timeout: { request: 12_000 },
    retry: { limit: 1 },
  }).text();

  // Try to parse OpenAI-like response: choices[0].message.content
  try {
    const json: any = JSON.parse(body);
    console.log("Ark response:", json);
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content === "string") return extractArkMeta(content);
    if (Array.isArray(content)) {
      const text = content
        .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .filter(Boolean)
        .join("\n");
      return extractArkMeta(text);
    }
  } catch {
    // ignore
  }

  // Fallback: treat response as plain text
  return extractArkMeta(body);
}

async function searchNeteaseLrc({ title, artist, searchUrlTemplate, lyricUrlTemplate }: SearchNeteaseParams) {
  const safeTitle = title?.trim() ?? "";
  const safeArtist = artist?.trim() ?? "";
  const query = [safeTitle, safeArtist].filter(Boolean).join(" ").trim();
  if (!query) return null;

  const safeSearchUrlTemplate =
    searchUrlTemplate?.trim() || "https://music.163.com/api/search/get?s={query}&type=1&limit=1&offset=0";
  const safeLyricUrlTemplate =
    lyricUrlTemplate?.trim() || "https://music.163.com/api/song/lyric?os=pc&id={id}&lv=-1&kv=-1&tv=-1";

  const requestText = async (url: string) => {
    return got(url, {
      headers: {
        "user-agent": "biu-lyrics-overlay",
        referer: "https://music.163.com/",
        accept: "application/json, text/plain, */*",
      },
      timeout: { request: 10_000 },
      retry: { limit: 1 },
    }).text();
  };

  const tryParseSongId = (body: string) => {
    try {
      const json: any = JSON.parse(body);
      console.log("[lyrics] netease search response:", json);
      const songId = json?.result?.songs?.[0]?.id;
      if (typeof songId === "number" && songId > 0) return songId;

      // 某些网络环境会返回加密的 `result` 字符串（例如 abroad=true），这里不做解密，改用 fallback endpoint 重试。
      if (typeof json?.result === "string") {
        log.warn("[lyrics] netease search returned encrypted result; trying fallbacks", {
          abroad: json?.abroad,
          code: json?.code,
        });
      }
    } catch {
      // ignore
    }
    return undefined;
  };

  const encodedQuery = encodeURIComponent(query);
  const searchUrls = [
    safeSearchUrlTemplate.replaceAll("{query}", encodedQuery),
    `https://music.163.com/api/search/get?s=${encodedQuery}&type=1&limit=1&offset=0`,
    `https://music.163.com/api/search/pc?s=${encodedQuery}&type=1&limit=1&offset=0`,
    `https://music.163.com/api/cloudsearch/pc?s=${encodedQuery}&type=1&limit=1&offset=0`,
  ];

  let songId: number | undefined;
  for (const url of searchUrls) {
    try {
      const body = await requestText(url);
      const id = tryParseSongId(body);
      if (id) {
        songId = id;
        break;
      }
    } catch (err) {
      log.warn("[lyrics] netease search request failed", {
        url,
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }
  if (!songId) return null;

  const lyricUrl = safeLyricUrlTemplate.replaceAll("{id}", encodeURIComponent(String(songId)));
  const lyricResp = await requestText(lyricUrl);

  try {
    const json: any = JSON.parse(lyricResp);
    const lrc = json?.lrc?.lyric;
    if (typeof lrc === "string" && lrc.trim().length > 0) return lrc;
  } catch {
    // ignore
  }

  return null;
}

export function registerLyricsHandlers() {
  ipcMain.handle(channel.lyrics.search, async (_evt, params: SearchLyricsParams) => {
    const urlTemplate = params?.urlTemplate?.trim();
    if (!urlTemplate) return null;

    const url = buildUrlFromParts({ ...params, urlTemplate });

    const body = await got(url, {
      headers: {
        "user-agent": "biu-lyrics-overlay",
        accept: "*/*",
      },
      timeout: {
        request: 10_000,
      },
      retry: { limit: 1 },
    }).text();

    return body;
  });

  ipcMain.handle(channel.lyrics.searchNetease, async (_evt, params: SearchNeteaseParams) => {
    return searchNeteaseLrc(params ?? {});
  });

  ipcMain.handle(channel.lyrics.resolveTitle, async (_evt, params: ResolveTitleParams) => {
    const cacheKey = params?.cacheKey?.trim();
    if (!cacheKey) return null;

    const cachedMap = (lyricsCacheStore.get("titles") as Record<string, any>) ?? {};
    const cached = cachedMap[cacheKey];
    if (cached && typeof cached === "object") {
      const cachedTitle = (cached as any)?.title;
      if (typeof cachedTitle === "string" && cachedTitle.trim().length > 0) return cachedTitle.trim();
    }
    if (typeof cached === "string" && cached.trim().length > 0) return cached.trim();

    const urlTemplate = params?.urlTemplate?.trim();
    if (!urlTemplate) return null;

    const url = buildUrlFromParts({ urlTemplate, title: params?.title, artist: params?.artist });
    const body = await got(url, {
      headers: {
        "user-agent": "biu-lyrics-overlay",
        accept: "*/*",
      },
      timeout: { request: 10_000 },
      retry: { limit: 1 },
    }).text();

    const resolved = extractTitleText(body).trim();
    if (!resolved) return null;

    lyricsCacheStore.set("titles", { ...cachedMap, [cacheKey]: { title: resolved } });
    return resolved;
  });

  ipcMain.handle(channel.lyrics.resolveTitleArk, async (_evt, params: ResolveTitleArkParams) => {
    const cacheKey = params?.cacheKey?.trim();
    if (!cacheKey) return null;

    const cachedMap = (lyricsCacheStore.get("titles") as Record<string, any>) ?? {};
    const cached = cachedMap[cacheKey];
    if (cached && typeof cached === "object") {
      const cachedTitle = (cached as any)?.title;
      if (typeof cachedTitle === "string" && cachedTitle.trim().length > 0) return cached as any;
    }
    if (typeof cached === "string" && cached.trim().length > 0) {
      // Backward-compat: old cache stored a raw string.
      return { title: cached.trim() };
    }

    const resolved = await resolveSongMetaViaArk({ title: params?.title, artist: params?.artist });
    log.info("[lyrics] resolveSongMetaViaArk response:", resolved);
    if (!resolved?.title?.trim()) return null;

    const value = { title: resolved.title.trim(), artist: resolved.artist?.trim() };
    lyricsCacheStore.set("titles", { ...cachedMap, [cacheKey]: value });
    return value;
  });
}
