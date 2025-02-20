import { atom } from "jotai";

/**
 * 当前播放的歌曲
 */
export const playingSongAtom = atom<Song | null>(null);
