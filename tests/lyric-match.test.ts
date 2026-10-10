import { describe, expect, test } from "vitest";

import {
  buildSearchQueries,
  buildTitleCandidates,
  cleanTrackTitle,
  hasTimedLyrics,
  isAcceptableMatch,
  normalizeForCompare,
  rankNeteaseSongs,
  scoreNeteaseSong,
  splitTitleCandidates,
} from "@/common/utils/lyric-match";

describe("buildSearchQueries", () => {
  test("用书名号里的歌名当搜索词，而不是整串标题", () => {
    const queries = buildSearchQueries({ artist: "某UP主", title: "中日双语版《雨爱》老头子携影分身#合唱" });

    expect(queries[0]).toBe("雨爱");
    expect(queries).not.toContain("中日双语版《雨爱》老头子携影分身#合唱");
  });

  test("歌名 - 歌手 形式会给出歌名搜索词", () => {
    const queries = buildSearchQueries({ title: "晴天 - 周杰伦" });

    expect(queries[0]).toBe("晴天");
    expect(queries).toContain("周杰伦");
  });

  test("《…OST》是专辑名，后面的正文优先作为歌名搜索", () => {
    const queries = buildSearchQueries({ title: "《鸣潮 3.2 OST》致那暖明黄金 | 西格莉卡主题曲" });

    expect(queries[0]).toBe("致那暖明黄金");
    expect(queries).toContain("鸣潮 3.2 OST");
  });

  test("全角括号与方框线分隔符也能抓出歌名", () => {
    expect(buildSearchQueries({ title: "［今日后朋/heavy wave］再见，我永生的孤独" })).toContain("再见，我永生的孤独");
    expect(buildSearchQueries({ title: "「每日后朋」坠入繁星之中，直到黎明到来│навсегда│Дурной Bкус" })).toContain(
      "坠入繁星之中，直到黎明到来",
    );
  });

  test("游戏 OST 常见写法：书名号专辑 + 引号歌名", () => {
    const queries = buildSearchQueries({ title: "《鸣潮》秧秧·玄翎 主题曲「玄翎谣」百万级录音棚试听" });

    expect(queries).toContain("玄翎谣");
  });
});

describe("buildTitleCandidates", () => {
  test("优先取书名号里的歌名（B 站标题常见写法）", () => {
    const candidates = buildTitleCandidates("中日双语版《雨爱》老头子携影分身#合唱");

    expect(candidates[0]).toBe("雨爱");
    expect(candidates).toContain("雨爱");
  });

  test("支持单书名号〈〉里的歌名", () => {
    expect(buildTitleCandidates("【鸣潮/翻唱】全网最温柔！〈月声尽，心灯明〉史诗感拉满了")).toContain("月声尽，心灯明");
  });

  test("有意义的括号内容会保留，装饰性括号会丢弃", () => {
    expect(buildTitleCandidates("【翻唱】起风了")).toContain("起风了");
    expect(buildTitleCandidates("【高音质】晴天")).not.toContain("高音质");
  });

  test("多段标题会拆出歌名与歌手", () => {
    const candidates = buildTitleCandidates("晴天 - 周杰伦");

    expect(candidates).toContain("晴天");
    expect(candidates).toContain("周杰伦");
  });

  test("未收录的装饰词不影响歌名候选（按空白切分兜底）", () => {
    const candidates = buildTitleCandidates("雨爱 高清修复版 收藏级");

    expect(candidates).toContain("雨爱");
  });

  test("泛词、版本号、英文虚词不会被当成歌名", () => {
    expect(buildTitleCandidates("《终末地 1.4 OST》「幽台试验场」北部禁区「BGM」加长版")).not.toContain("BGM");
    expect(buildTitleCandidates("《鸣潮 3.1 OST》爱弥斯的家")).not.toContain("3.1");
    expect(buildTitleCandidates("Ray -- from 超时空辉夜姬")).not.toContain("from");
  });
});

describe("cleanTrackTitle", () => {
  test("去掉装饰性括号片段", () => {
    expect(cleanTrackTitle("【高音质】晴天【翻唱】")).toBe("晴天");
    expect(cleanTrackTitle("晴天 (Cover 周杰伦)")).toBe("晴天");
  });

  test("去掉话题标签与整词装饰", () => {
    expect(cleanTrackTitle("《雨爱》中日双语版#合唱")).toBe("雨爱");
    expect(cleanTrackTitle("起风了 男声版")).toBe("起风了");
  });

  test("保留有意义的括号内容", () => {
    expect(cleanTrackTitle("【中文填词】lemon")).toBe("中文填词 lemon");
  });

  test("空值返回空字符串", () => {
    expect(cleanTrackTitle()).toBe("");
    expect(cleanTrackTitle("   ")).toBe("");
  });
});

describe("splitTitleCandidates", () => {
  test("按常见分隔符切分歌名与歌手", () => {
    expect(splitTitleCandidates("晴天 - 周杰伦")).toEqual(["晴天", "周杰伦"]);
    expect(splitTitleCandidates("起风了 ／ 买辣椒也用券")).toEqual(["起风了", "买辣椒也用券"]);
  });
});

describe("normalizeForCompare", () => {
  test("忽略大小写、空白与标点", () => {
    expect(normalizeForCompare("Hello, World!")).toBe("helloworld");
    expect(normalizeForCompare("《晴天》")).toBe("晴天");
  });
});

describe("hasTimedLyrics", () => {
  test("识别带时间标签的歌词", () => {
    expect(hasTimedLyrics("[00:12.30]第一句")).toBe(true);
    expect(hasTimedLyrics("[01:02]第一句")).toBe(true);
    expect(hasTimedLyrics("纯文本歌词")).toBe(false);
    expect(hasTimedLyrics()).toBe(false);
  });
});

describe("scoreNeteaseSong / rankNeteaseSongs", () => {
  const hints = { artist: "周杰伦", duration: 269, title: "【高音质】晴天 - 周杰伦" };

  const exact: NeteaseSong = {
    id: 1,
    name: "晴天",
    duration: 269_000,
    artists: [{ name: "周杰伦" }],
  };

  const containsOnly: NeteaseSong = {
    id: 2,
    name: "晴天 (Live)",
    duration: 260_000,
    artists: [{ name: "其他歌手" }],
  };

  const unrelated: NeteaseSong = {
    id: 3,
    name: "完全不相干的歌",
    duration: 200_000,
    artists: [{ name: "某人" }],
  };

  test("歌名与歌手完全一致得高分", () => {
    const score = scoreNeteaseSong(exact, hints);

    expect(score.name).toBe(100);
    expect(score.artist).toBe(30);
    expect(score.total).toBeGreaterThanOrEqual(150);
    expect(isAcceptableMatch(score)).toBe(true);
  });

  test("歌名包含但歌手不符时不可自动采用", () => {
    const score = scoreNeteaseSong(containsOnly, hints);

    expect(score.name).toBe(60);
    expect(isAcceptableMatch(score)).toBe(false);
  });

  test("完全不相干的结果不会通过", () => {
    expect(isAcceptableMatch(scoreNeteaseSong(unrelated, hints))).toBe(false);
  });

  test("排序后最匹配的排在最前，且过滤掉不合格候选", () => {
    const ranked = rankNeteaseSongs([unrelated, containsOnly, exact], hints);

    expect(ranked).toHaveLength(1);
    expect(ranked[0].song.id).toBe(1);
  });

  test("B 站风格长标题里的书名号歌名也能自动匹配", () => {
    const messyHints = { artist: "某UP主", duration: 271, title: "中日双语版《雨爱》老头子携影分身#合唱" };
    const song: NeteaseSong = { id: 9, name: "雨爱", duration: 271_000, artists: [{ name: "杨丞琳" }] };

    const score = scoreNeteaseSong(song, messyHints);

    expect(score.name).toBe(100);
    expect(isAcceptableMatch(score)).toBe(true);
    expect(rankNeteaseSongs([song], messyHints)).toHaveLength(1);
  });

  test("时长差超过 90 秒的片段版会被排除", () => {
    const song: NeteaseSong = { id: 11, name: "晴天", duration: 112_000, artists: [{ name: "Jay" }] };

    const score = scoreNeteaseSong(song, hints);

    expect(score.name).toBe(100);
    expect(score.durationGap).toBe(157);
    expect(isAcceptableMatch(score)).toBe(false);
    expect(rankNeteaseSongs([song], hints)).toHaveLength(0);
  });

  test("网易云曲名比 B 站标题多出后缀时按强信号接受", () => {
    const ostHints = { title: "《鸣潮 3.3 OST》达妮娅剧情主题曲 | 谎言奏鸣曲" };
    const song: NeteaseSong = {
      id: 21,
      name: "谎言奏鸣曲 (达妮娅剧情主题曲)",
      artists: [{ name: "鸣潮先约电台" }],
    };

    const score = scoreNeteaseSong(song, ostHints);

    expect(score.name).toBeGreaterThanOrEqual(80);
    expect(isAcceptableMatch(score, song.name, ostHints)).toBe(true);
  });

  test("作品系列不一致且无硬证据时，非精确匹配被否决", () => {
    const ostHints = { artist: "HQM-Hugo魁Music", title: "《终末地 1.4 OST》「幽台试验场」北部禁区「BGM」加长版" };
    const song: NeteaseSong = {
      id: 31,
      name: "终末地登录界面音乐 Login Theme",
      artists: [{ name: "池夏岚Official." }],
      duration: 200_000,
    };

    const score = scoreNeteaseSong(song, ostHints);

    expect(isAcceptableMatch(score, song.name, ostHints)).toBe(false);
  });

  test("书名号里是真正的歌名（非 OST 专辑）时不会被误当系列名过滤", () => {
    const hints = { title: "回春丹乐队《鲜花》百万豪装录音棚大声听" };
    const song: NeteaseSong = { id: 41, name: "鲜花", artists: [{ name: "回春丹" }] };

    const score = scoreNeteaseSong(song, hints);

    expect(score.name).toBe(100);
    expect(isAcceptableMatch(score, song.name, hints)).toBe(true);
  });
});
