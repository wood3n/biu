/** 平假名 U+3040-U+309F、片假名 U+30A0-U+30FF、半角片假名 U+FF65-U+FF9F */
export const isKana = (char: string): boolean => {
  const code = char.codePointAt(0);
  if (code === undefined) return false;
  if (code >= 0x3040 && code <= 0x309f) return true;
  if (code >= 0x30a0 && code <= 0x30ff) return true;
  if (code >= 0xff65 && code <= 0xff9f) return true;
  return false;
};

/** 判断歌词是否为日语：假名占比 ≥ 15% 视为日语 */
export const isJapaneseLyrics = (lyrics: LyricLine[]): boolean => {
  if (!lyrics.length) return false;

  let kanaCount = 0;
  let totalCount = 0;

  for (const line of lyrics) {
    for (const char of line.text) {
      if (/\s/.test(char)) continue;
      totalCount += 1;
      if (isKana(char)) kanaCount += 1;
    }
  }

  if (totalCount === 0) return false;

  return kanaCount / totalCount >= 0.15;
};
