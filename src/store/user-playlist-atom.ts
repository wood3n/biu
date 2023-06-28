import toast from 'react-hot-toast';
import { atom, useAtom } from 'jotai';
import type { PlaylistInfoType } from '@service/user-playlist';
import {
  getUserPlaylist,
  postPlaylistCreate,
  postPlaylistDelete,
  getPlaylistSubscribe,
} from '@/service';
import { type PlaylistCreateRequestData } from '@service/playlist-create';
import { type PlaylistDeleteRequestData } from '@service/playlist-delete';
import useUser from './user-atom';

/**
 * 用户歌单列表
 */
export const userPlaylistAtom = atom<PlaylistInfoType[] | undefined>(undefined);

export const useUserPlaylist = () => {
  const [user] = useUser();
  const [playlist, setPlaylist] = useAtom(userPlaylistAtom);

  const selfCreatedPlaylist = playlist?.filter((item) => item.creator?.userId === user?.userInfo?.profile?.userId);

  const collectedPlaylist = playlist?.filter((item) => item.creator?.userId !== user?.userInfo?.profile?.userId);

  const refresh = async (uid: number) => getUserPlaylist({
    uid,
    limit: 1000,
    offset: 0,
  }).then(({ playlist }) => {
    setPlaylist(playlist);
  });

  // 创建歌单
  const add = async (data: PlaylistCreateRequestData, cb?: VoidFunction) => postPlaylistCreate(data).then(({ code, id }) => {
    if (code === 200 && id) {
      toast.success('创建成功');
      cb?.();
    }
  });

  // 删除歌单
  const rm = async (data: PlaylistDeleteRequestData, cb?: VoidFunction) => postPlaylistDelete(data).then(({ code, id }) => {
    if (code === 200 && id) {
      toast.success('删除成功');
      cb?.();
    }
  });

  // 收藏歌单
  const collect = (id?: number | string, cb?: VoidFunction) => getPlaylistSubscribe({
    id,
    t: 1,
  }).then(({ code, id }) => {
    if (code === 200 && id) {
      toast.success('收藏成功');
      cb?.();
    }
  });

  const cancelCollect = (id?: number | string, cb?: VoidFunction) => getPlaylistSubscribe({
    id,
    t: 2,
  }).then(({ code, id }) => {
    if (code === 200 && id) {
      toast.success('已取消收藏');
      cb?.();
    }
  });

  const isCollect = (pid?: number | string) => !!collectedPlaylist?.find((item) => item.id === Number(pid));

  const isCreated = (pid?: number | string) => !!selfCreatedPlaylist?.find((item) => item.id === Number(pid));

  return {
    playlist,
    selfCreatedPlaylist,
    collectedPlaylist,
    isCreated,
    isCollect,
    add,
    rm,
    refresh,
    collect,
    cancelCollect,
  };
};
