import { atom } from 'jotai';
import type { Song } from '@service/playlist-track-all';

/**
 * 用户播放列表
 */
export const musicListAtom = atom<Song[]>([]);
