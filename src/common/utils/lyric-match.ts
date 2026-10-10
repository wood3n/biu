/**
 * 歌词自动匹配：把 B 站视频标题清洗成歌名，再去网易云 / LRCLIB 搜索并打分挑选。
 * 目标与 BBPlayer 的思路一致：优先用音乐平台的歌词，B 站字幕（很多是 ASR）只作兜底。
 */

export interface LyricsMatchHints {
  /** UP 主 / 歌手名称 */
  artist?: string;
  /** 时长（秒），用于辅助判断 */
  duration?: number;
  /** 视频标题或分集标题 */
  title?: string;
}

export interface LyricsMatchResult {
  /** 匹配置信度：strong = 歌名完全一致且有时长/歌手佐证；medium = 高相似；weak = 仅弱包含 */
  confidence?: LyricsConfidence;
  /** 展示用信息，例如 "晴天 - 周杰伦" */
  label: string;
  lyrics: string;
  /** 匹配到的平台歌手 */
  matchArtist?: string;
  /** 匹配到的平台曲名 */
  matchName?: string;
  source: LyricsSource;
  tLyrics?: string;
}

export type LyricsConfidence = "medium" | "strong" | "weak";

export interface CandidateScore {
  /** 与标题里系列/专辑名的契合度加分 */
  affinity: number;
  artist: number;
  duration: number;
  /** 与视频时长相差的秒数，未提供时长时为 undefined */
  durationGap?: number;
  name: number;
  /** 最佳歌名候选是否来自书名号/引号（引号里的内容可信度更高） */
  quoted: boolean;
  total: number;
}

/** 时长相差超过该秒数的候选直接排除（避免匹配到片段版 / DJ 版） */
const MAX_DURATION_GAP = 90;

/** 标题里属于"装饰"的片段，匹配歌词时应当丢弃 */
const DECORATION_PATTERN =
  /(翻唱|cover|高音质|无损|纯音乐|伴奏|官方|字幕|中字|完整版|动态歌词|歌词版|hi-?res|4k|1080p|720p|60fps|合集|联投|第\s*\d+\s*[集话期]|p\s*\d+|full\s*ver|music\s*video|现场|电台|live)/i;

/** 整词级的装饰前缀 / 后缀，例如"中日双语版""男声版""百万级录音棚试听" */
const DECORATION_TOKENS =
  /(中日双语版?|双语版?|中文版|日文版|完整版|高清修复版?|修复版|超清|高清|高音质版?|无损音质|无损版?|纯享版?|男声版?|女声版?|合唱版?|ai翻唱|ai声线|伴奏版?|消音|和声版?|纯音乐|钢琴版?|吉他版?|8d环绕|环绕版?|双声道|全景声|杜比|母带|现场版?|试听版?|试听|电台版?|合集版?|剪辑版?|混剪|串烧|连唱|片段|副歌|车载|助眠|学习|专注|背景音乐|bgm|dj版?|慢速|加速|动态歌词|歌词版?|主题曲|剧情插曲|插曲|片尾曲|片头曲|官方版|变奏版|加长版|附歌词|中英歌词|中日歌词|中文字幕|录音棚|百万级|提取版|游戏版?|music\s*video|full\s*ver)/gi;

/** 书名号 / 引号 / 括号内的内容，其中书名号与引号通常就是歌名 */
const QUOTE_PATTERN =
  /《([^》]+)》|〈([^〉]+)〉|【([^】]+)】|「([^」]+)」|『([^』]+)』|[“"]([^”"]+)[”"]|（([^）]+)）|\(([^)]+)\)|\[([^\]]+)\]/g;

/** 书名号里是专辑 / 原声带时的特征，例如《鸣潮 3.5 OST》 */
const ALBUM_PATTERN = /(ost|soundtrack|原声|原声带|专辑|精选集|音乐集)/i;

/**
 * 这些词本身不能作为"歌名"使用：B 站标题里它们只是分类标签，
 * 拿去搜索会命中一堆无关歌曲（例如网易云上真有叫「BGM」的曲子）
 */
const GENERIC_CANDIDATE_PATTERN =
  /^(bgm|ost|ep|op|ed|pv|mv|demo|remix|intro|outro|instrumental|i|ii|iii|iv|v|vi|vii|viii|ix|x|from|with|the|and|for|you|me|my|your|our|this|that|ver|version|feat|ft|full|part|pt|original|audio|video|song|track|theme|boss战?|战斗曲?|决战|序章|序曲|终章|插曲|主题曲|片尾曲|片头曲|前奏|间奏|尾声|伴奏|纯音乐|试听|完整版|加长版|变奏版|变奏|现场版|电台|合集|片段|剪辑|剧情|场景|鉴赏|纪念|庆典|动画|预告|主题|音乐|游戏|官方|原唱|翻唱|歌词|字幕|中字|双语|国语|日语|英语)$/i;

const BRACKET_PATTERN = /[【[（(〔［｛]([^】\]）)〕］｝]*)[】\]）)〕］｝]/g;

const SEPARATOR_PATTERN = /\s*[-–—－_|｜│┃/／·・~～&＆、]\s*/;

/** 全局版分隔符，用于把候选串整体切成片段 */
const SEPARATOR_PATTERN_ALL = new RegExp(SEPARATOR_PATTERN.source, "g");

/** 标题末尾的话题标签，例如 #合唱 */
const TOPIC_TAG_PATTERN = /[#＃][^\s#＃]+/g;

const TIME_TAG_PATTERN = /\[\d{1,2}:\d{1,2}(?:[.:]\d{1,3})?\]/;

/** 去掉标题里的装饰片段（【翻唱】【高音质】、中日双语版、#话题等），保留有意义的括号内容 */
export function cleanTrackTitle(raw?: string): string {
  if (!raw) return "";

  const withoutTopic = raw.replace(TOPIC_TAG_PATTERN, " ");

  const withoutDecoration = withoutTopic.replace(BRACKET_PATTERN, (_match, inner: string) => {
    const content = String(inner ?? "").trim();
    if (!content) return " ";

    return DECORATION_PATTERN.test(content) ? " " : ` ${content} `;
  });

  return (
    withoutDecoration
      .replace(DECORATION_TOKENS, " ")
      // 书名号与引号只保留其中内容，便于"《雨爱》"这类标题变成干净的歌名
      .replace(/[《》「」『』“”"]/g, " ")
      .replace(/[_|｜]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/** 把清洗后的标题按常见分隔符切分成候选歌名 */
export function splitTitleCandidates(cleaned?: string): string[] {
  if (!cleaned) return [];

  return cleaned
    .split(SEPARATOR_PATTERN)
    .map(part => part.trim())
    .filter(Boolean);
}

/**
 * 汇总用于匹配的歌名候选。
 * - 《…OST…》这类专辑名后面的正文通常才是歌名，优先提取
 * - 其次是书名号 / 引号里的内容（多数情况下就是歌名）
 * - 最后是清洗后标题的分隔片段与空白片段
 */
export function buildTitleCandidates(raw?: string): string[] {
  if (!raw) return [];

  const candidates: string[] = [];
  const seriesFingerprints = getSeriesFingerprints(raw);
  const push = (value?: string) => {
    const text = value?.trim();

    if (!text || DECORATION_PATTERN.test(text) || GENERIC_CANDIDATE_PATTERN.test(text) || candidates.includes(text))
      return;

    // 纯数字/版本号（"3.1""1.4"）不是歌名
    if (/^\d+(?:[.\-_]\d+)*$/.test(text)) return;

    // 系列 / 专辑名本身不是歌名（"终末地""鸣潮"这类词去搜索只会命中无关曲子）
    const normalized = normalizeForCompare(text);
    if (
      seriesFingerprints.some(
        fingerprint => normalized === fingerprint || (normalized.length >= 2 && fingerprint.startsWith(normalized)),
      )
    ) {
      return;
    }

    candidates.push(text);
  };

  const pushSegments = (source?: string) => {
    if (!source) return;

    const cleanedSource = cleanTrackTitle(source);

    // 先切出最细粒度的片段（最像歌名），再补上整段，保证搜索词优先级正确
    const tokens = cleanedSource
      .replace(SEPARATOR_PATTERN_ALL, " ")
      .split(/\s+/)
      .map(part => part.trim())
      .filter(part => part.length >= 2);

    tokens.forEach(push);
    splitTitleCandidates(cleanedSource).forEach(push);
    push(cleanedSource);
  };

  const quotes: { content: string; end: number }[] = [];

  for (const match of raw.matchAll(QUOTE_PATTERN)) {
    const content = match.slice(1).find(Boolean)?.trim();
    if (!content) continue;

    quotes.push({ content, end: (match.index ?? 0) + match[0].length });
  }

  const albumQuote = quotes.find(quote => ALBUM_PATTERN.test(quote.content));
  if (albumQuote) {
    pushSegments(raw.slice(albumQuote.end));
  }

  quotes.forEach(quote => push(quote.content));

  pushSegments(raw);

  return candidates;
}

/** 只取书名号 / 引号里的内容作为候选（引号内的内容可信度更高） */
export function buildQuotedCandidates(raw?: string): string[] {
  if (!raw) return [];

  const quoted: string[] = [];

  for (const match of raw.matchAll(QUOTE_PATTERN)) {
    const content = match.slice(1).find(Boolean)?.trim();

    if (!content || DECORATION_PATTERN.test(content) || GENERIC_CANDIDATE_PATTERN.test(content)) continue;
    if (!quoted.includes(content)) quoted.push(content);
  }

  return quoted;
}

/**
 * 生成搜索关键词：用最像歌名的候选去搜，而不是整串标题。
 * 例如 "中日双语版《雨爱》老头子携影分身#合唱" -> ["雨爱", ...]
 */
export function buildSearchQueries(hints: LyricsMatchHints): string[] {
  const candidates = buildTitleCandidates(hints.title);
  const queries: string[] = [];
  const push = (value?: string) => {
    const text = value?.trim();

    // 过长的候选基本是整串标题，搜了也没用
    if (!text || text.length > 28 || queries.includes(text)) return;

    queries.push(text);
  };

  candidates.slice(0, 6).forEach(push);

  const primary = candidates[0];
  if (primary && hints.artist && !primary.includes(hints.artist)) {
    push(`${primary} ${hints.artist}`);
  }

  return queries.slice(0, 7);
}

/** 比较用的归一化：忽略大小写、空白与标点 */
export function normalizeForCompare(text?: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(/[\u0021-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007e]/g, "")
    .replace(/[，。！？、；：“”‘’（）《》【】…—～·]/g, "");
}

/** 歌词文本是否包含时间标签（能逐句滚动） */
export function hasTimedLyrics(text?: null | string): boolean {
  return Boolean(text && TIME_TAG_PATTERN.test(text));
}

/** 给网易云搜索结果打分：歌名权重最高，其次是歌手与时长 */
export function scoreNeteaseSong(song: NeteaseSong, hints: LyricsMatchHints): CandidateScore {
  const candidates = buildTitleCandidates(hints.title);
  const nameHints = candidates.map(normalizeForCompare).filter(Boolean);
  const songName = normalizeForCompare(song.name);
  const quotedNames = new Set(buildQuotedCandidates(hints.title).map(normalizeForCompare).filter(Boolean));

  let name = 0;
  let quoted = false;

  if (songName) {
    nameHints.forEach(hint => {
      let hintScore = 0;

      if (hint === songName) {
        hintScore = 100;
      } else if (hint.length >= 2 && (songName.includes(hint) || hint.includes(songName))) {
        const shorter = Math.min(hint.length, songName.length);
        const longer = Math.max(hint.length, songName.length);
        const isPrefix = songName.startsWith(hint) || hint.startsWith(songName);

        // 网易云曲名常在歌名后追加"（剧情主题曲）"等后缀，
        // 因此"前缀一致且长度足够"或"字符覆盖率很高"都视为强信号
        hintScore = (isPrefix && shorter >= 3) || shorter / longer >= 0.6 ? 80 : 60;
      }

      if (hintScore > name) {
        name = hintScore;
        quoted = quotedNames.has(hint);
      }
    });
  }

  const artistTargets = (song.artists ?? []).map(artist => normalizeForCompare(artist.name)).filter(Boolean);
  const artistHints = [hints.artist, ...candidates].map(normalizeForCompare).filter(Boolean);
  let artist = 0;

  artistTargets.forEach(target => {
    artistHints.forEach(hint => {
      if (hint === target) {
        artist = Math.max(artist, 30);
      } else if (hint.length >= 2 && (hint.includes(target) || target.includes(hint))) {
        artist = Math.max(artist, 15);
      }
    });
  });

  let durationBonus = 0;
  let durationGap: number | undefined;

  const songSeconds = song.duration ? song.duration / 1000 : undefined;

  if (songSeconds && hints.duration) {
    durationGap = Math.abs(songSeconds - hints.duration);

    if (durationGap <= 5) durationBonus = 20;
    else if (durationGap <= 15) durationBonus = 5;
  }

  // 系列/专辑契合度：标题里的《鸣潮 3.2 OST》等作品名出现在网易云的曲名/专辑名/歌手里，
  // 说明大概率是同一部作品的原声，而不是同名的无关歌曲
  let affinity = 0;
  const songContext = normalizeForCompare(
    `${song.name ?? ""}${song.album?.name ?? ""}${(song.artists ?? []).map(artist => artist.name ?? "").join("")}`,
  );

  if (songContext) {
    affinity = getSeriesFingerprints(hints.title).some(
      fingerprint => fingerprint.length >= 2 && songContext.includes(fingerprint),
    )
      ? 25
      : 0;
  }

  return {
    affinity,
    artist,
    duration: durationBonus,
    durationGap,
    name,
    quoted,
    total: name + artist + durationBonus + affinity,
  };
}

/**
 * 从标题里提取系列/专辑指纹。
 * 只有带 OST / 原声 / 专辑 字样的书名号才算"作品名"（《鸣潮 3.2 OST》-> 鸣潮），
 * 否则会把《鲜花》这种真正的歌名误当成系列名。
 */
function getSeriesFingerprints(title?: string): string[] {
  if (!title) return [];

  const fingerprints: string[] = [];

  for (const match of title.matchAll(QUOTE_PATTERN)) {
    const content = match.slice(1).find(Boolean)?.trim();
    if (!content || !ALBUM_PATTERN.test(content)) continue;

    // 去掉 OST / 原声 / 版本号后取前几个字作为作品指纹：
    // 《鸣潮 3.3 OST》-> 鸣潮，《终末地 1.4 OST》-> 终末地
    const normalized = normalizeForCompare(content).replace(/(ost|soundtrack|原声带?|专辑|精选集|音乐集)/gi, "");
    const leading = normalized.match(/^[\u4e00-\u9fa5a-z]+/)?.[0] ?? "";
    const fingerprint = leading.slice(0, 4);

    if (fingerprint.length >= 2) fingerprints.push(fingerprint);
  }

  return [...new Set(fingerprints)];
}

/**
 * 是否可以作为自动匹配结果。四道精度闸门：
 * 1. 时长相差过大直接排除
 * 2. 标题属于某部作品、但匹配到的曲子与该作品毫无关联且无硬证据 → 拒绝
 *    （否则《终末地 1.4 OST》里所有视频都会被匹配到同一首无关曲子）
 * 3. 短歌名（"心""ep""BGM""阶段"）必须有歌手 / 时长 / 系列契合度佐证
 * 4. 60 分的弱包含（标题只是"提到了"某首歌）必须有歌手或时长这样的硬证据
 */
export function isAcceptableMatch(score: CandidateScore, songName?: string, hints?: LyricsMatchHints): boolean {
  if (score.durationGap !== undefined && score.durationGap > MAX_DURATION_GAP) return false;

  const nameLength = normalizeForCompare(songName).length;
  const hasHardEvidence = score.artist >= 15 || score.duration >= 20;
  const seriesConsistent = score.affinity > 0;
  const hasSeries = getSeriesFingerprints(hints?.title).length > 0;

  // 系列不一致时："非精确匹配"直接否决；"精确匹配"只否决单个英文单词这种弱证据
  // （"Guided""From"这类词命中一首同名英文歌几乎必然是错的）
  const rawName = (songName ?? "").trim();
  const weakExactWord = !score.quoted && !/\s/.test(rawName) && /^[\u0020-\u007e]+$/.test(rawName);

  if (hasSeries && !seriesConsistent && !hasHardEvidence && (score.name < 100 || weakExactWord)) return false;

  if (score.name >= 100) {
    if (nameLength > 0 && nameLength <= 3) return hasHardEvidence || seriesConsistent;

    return true;
  }

  // 80 分来自"前缀一致 / 覆盖率 ≥60%"，曲名太短或来源不可信时需要佐证
  if (score.name >= 80) {
    if (nameLength < 3) return false;
    if (weakExactWord && !hasHardEvidence && !seriesConsistent) return false;

    return score.quoted || nameLength >= 4 || hasHardEvidence || seriesConsistent;
  }

  return score.name >= 60 && hasHardEvidence;
}

/** 匹配置信度分级，便于界面/排查区分"确定"与"疑似" */
export function classifyMatchConfidence(score: CandidateScore): LyricsConfidence {
  if (score.name >= 100 && (score.artist >= 15 || score.duration >= 20 || score.affinity > 0)) return "strong";
  if (score.name >= 80) return "medium";

  return "weak";
}

/** 按得分排序出可用的网易云候选 */
export function rankNeteaseSongs(songs: NeteaseSong[] | undefined, hints: LyricsMatchHints) {
  return (songs ?? [])
    .map(song => ({ score: scoreNeteaseSong(song, hints), song }))
    .filter(item => Boolean(item.song.id) && isAcceptableMatch(item.score, item.song.name, hints))
    .toSorted((a, b) => b.score.total - a.score.total);
}

function formatNeteaseArtists(song: NeteaseSong) {
  return (song.artists ?? [])
    .map(artist => artist.name)
    .filter(Boolean)
    .join(" / ");
}

function formatNeteaseLabel(song: NeteaseSong) {
  const artists = formatNeteaseArtists(song);
  const name = song.name ?? "未知歌曲";

  return artists ? `${name} - ${artists}` : name;
}

function scoreLrclibSong(song: SearchSongByLrclibResponse, hints: LyricsMatchHints) {
  const target = normalizeForCompare(song.trackName || song.name);
  const candidates = buildTitleCandidates(hints.title).map(normalizeForCompare).filter(Boolean);

  let score = 0;

  if (target) {
    candidates.forEach(hint => {
      if (hint === target) score += 100;
      else if (hint.length >= 2 && (hint.includes(target) || target.includes(hint))) score += 60;
    });
  }

  const artist = normalizeForCompare(song.artistName);
  const artistHint = normalizeForCompare(hints.artist);

  if (artist && artistHint) {
    if (artist === artistHint) score += 30;
    else if (artist.includes(artistHint) || artistHint.includes(artist)) score += 15;
  }

  if (song.duration && hints.duration) {
    const diff = Math.abs(song.duration - hints.duration);
    if (diff <= 5) score += 20;
    else if (diff <= 15) score += 5;
  }

  return score;
}

const NETEASE_SONG_TYPE = 1;
const SEARCH_LIMIT = 20;
/** 单次匹配最多尝试获取几首歌的歌词 */
const MAX_LYRICS_TRIES = 3;

async function fetchNeteaseLyrics(id: number) {
  const res = await window.electron.getNeteaseLyrics({ id });
  const lyrics = res?.lrc?.lyric?.trim() || res?.klyric?.lyric?.trim() || "";

  if (!hasTimedLyrics(lyrics)) return null;

  const tLyrics = res?.tlyric?.lyric?.trim();

  return { lyrics, tLyrics: tLyrics || undefined };
}

/**
 * 从网易云匹配歌词。
 * `skip` 用于"换一个匹配"：跳过前 N 个候选继续找。
 */
export async function matchLyricsFromNetease(
  hints: LyricsMatchHints,
  options?: { skip?: number },
): Promise<LyricsMatchResult | null> {
  const queries = buildSearchQueries(hints);
  if (!queries.length) return null;

  const ranked: { score: CandidateScore; song: NeteaseSong }[] = [];
  const seenIds = new Set<number>();

  for (const searchKeyword of queries) {
    try {
      const res = await window.electron.searchNeteaseSongs({
        s: searchKeyword,
        type: NETEASE_SONG_TYPE,
        limit: SEARCH_LIMIT,
        offset: 0,
      });

      rankNeteaseSongs(res?.result?.songs, hints).forEach(item => {
        const id = Number(item.song.id);
        if (seenIds.has(id)) return;

        seenIds.add(id);
        ranked.push(item);
      });
    } catch {
      // 单个查询失败不影响后续尝试
    }
  }

  // 汇总所有搜索词的结果后统一排序，
  // 否则"先搜到的次优结果"（例如同名翻唱）会盖过后面更匹配的原唱
  ranked.sort((a, b) => b.score.total - a.score.total);

  const start = Math.max(0, options?.skip ?? 0);
  let tried = 0;

  for (let index = start; index < ranked.length && tried < MAX_LYRICS_TRIES; index += 1) {
    tried += 1;

    const song = ranked[index].song;
    const id = song.id;
    if (!id) continue;

    try {
      const found = await fetchNeteaseLyrics(id);

      if (found) {
        return {
          confidence: classifyMatchConfidence(ranked[index].score),
          label: formatNeteaseLabel(song),
          lyrics: found.lyrics,
          matchArtist: formatNeteaseArtists(song) || undefined,
          matchName: song.name ?? undefined,
          source: "netease",
          tLyrics: found.tLyrics,
        };
      }
    } catch {
      // 获取失败则继续尝试下一个候选
    }
  }

  return null;
}

/** 从 LRCLIB 匹配歌词（网易云匹配失败时的兜底） */
export async function matchLyricsFromLrclib(hints: LyricsMatchHints): Promise<LyricsMatchResult | null> {
  const queries = buildSearchQueries(hints);
  if (!queries.length) return null;

  const attempts: SearchSongByLrclibParams[] = [];

  queries.slice(0, 2).forEach(query => {
    attempts.push({ q: query, track_name: query, artist_name: hints.artist });
    attempts.push({ q: query });
  });

  for (const params of attempts) {
    try {
      const list = await window.electron.searchLrclibLyrics(params);
      const candidates = (list ?? [])
        .filter(item => hasTimedLyrics(item.syncedLyrics))
        .filter(
          item => !item.duration || !hints.duration || Math.abs(item.duration - hints.duration) <= MAX_DURATION_GAP,
        )
        .filter(item => scoreLrclibSong(item, hints) >= 100)
        .toSorted((a, b) => scoreLrclibSong(b, hints) - scoreLrclibSong(a, hints));

      const best = candidates[0];

      if (best?.syncedLyrics) {
        const label = [best.trackName || best.name, best.artistName].filter(Boolean).join(" - ");
        const bestScore = scoreLrclibSong(best, hints);

        return {
          confidence: bestScore >= 130 ? "strong" : "medium",
          label: label || queries[0],
          lyrics: best.syncedLyrics,
          matchArtist: best.artistName ?? undefined,
          matchName: best.trackName || best.name || undefined,
          source: "lrclib",
        };
      }
    } catch {
      // 尝试下一个查询条件
    }
  }

  return null;
}

/** 单次自动匹配的整体超时，避免网络异常时界面一直停在"匹配中" */
const DEFAULT_MATCH_TIMEOUT = 15_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<null | T> {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), timeoutMs);

    promise
      .then(value => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

/** 依次尝试各音乐平台 */
export async function matchLyricsFromPlatforms(
  hints: LyricsMatchHints,
  options?: { skip?: number; timeoutMs?: number },
): Promise<LyricsMatchResult | null> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_MATCH_TIMEOUT;

  return withTimeout(
    (async () => {
      const netease = await matchLyricsFromNetease(hints, options);
      if (netease) return netease;

      // 已经在"换一个"时，不再重复回退到 LRCLIB，避免结果来回横跳
      if ((options?.skip ?? 0) > 0) return null;

      return matchLyricsFromLrclib(hints);
    })(),
    timeoutMs,
  );
}
