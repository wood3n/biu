import { atom, useAtom } from 'jotai';
import type { PlaylistInfoType } from '@service/user-playlist';

/**
 * 用户歌单列表
 */
export const userPlaylistAtom = atom<PlaylistInfoType[] | undefined>(undefined);

const useUserPlaylist = () => useAtom(userPlaylistAtom);

export default useUserPlaylist;
