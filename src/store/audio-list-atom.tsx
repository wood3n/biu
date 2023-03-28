import { atom } from 'jotai';
import type { Song } from '@service/playlist-track-all';

export const musicListAtom = atom<Song[]>([]);
