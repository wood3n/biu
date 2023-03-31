import { atom } from 'jotai';
import type { Song } from '@service/playlist-track-all';

/**
 * 当前正在播放歌曲
 */
export const playSongAtom = atom<Song | undefined>(undefined);
