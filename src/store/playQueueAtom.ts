import { atom } from 'jotai';
import type { Song } from '@service/playlist-track-all';

/**
 * 当前播放列表
 */
export const playQueueAtom = atom<Song[] | undefined>(undefined);
