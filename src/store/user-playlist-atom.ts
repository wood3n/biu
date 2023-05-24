import toast from 'react-hot-toast';
import { atom, useAtom } from 'jotai';
import type { PlaylistInfoType } from '@service/user-playlist';
import {
  getUserPlaylist,
  postPlaylistCreate,
  postPlaylistDelete,
} from '@/service';
import { type PlaylistCreateRequestData } from '@service/playlist-create';
import { type PlaylistDeleteRequestData } from '@service/playlist-delete';

/**
 * 用户歌单列表
 */
export const userPlaylistAtom = atom<PlaylistInfoType[] | undefined>(undefined);

export const useUserPlaylist = () => {
  const [playlist, setPlaylist] = useAtom(userPlaylistAtom);

  const refresh = async (uid: number) => getUserPlaylist({
    uid,
    limit: 1000,
    offset: 0,
  }).then(({ playlist }) => {
    setPlaylist(playlist);
  });

  const add = async (data: PlaylistCreateRequestData, cb?: VoidFunction) => postPlaylistCreate(data).then(({ code, id }) => {
    if (code === 200 && id) {
      toast.success('创建成功');
      cb?.();
    }
  });

  const rm = async (data: PlaylistDeleteRequestData, cb?: VoidFunction) => postPlaylistDelete(data).then(({ code, id }) => {
    if (code === 200 && id) {
      toast.success('创建成功');
      cb?.();
    }
  });

  return {
    playlist,
    add,
    rm,
    refresh,
  };
};
