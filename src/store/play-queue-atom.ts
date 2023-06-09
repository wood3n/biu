import { atom } from 'jotai';

/**
 * 当前播放列表
 */
export const playQueueAtom = atom<Song[]>([]);
