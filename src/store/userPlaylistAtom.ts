import { atom } from 'jotai';
import type { PlaylistInfoType } from '@service/user-playlist';

/**
 * 用户歌单列表
 */
export const userPlaylistAtom = atom<PlaylistInfoType[] | undefined>(undefined);
