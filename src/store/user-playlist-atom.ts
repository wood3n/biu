import { atom, useAtom } from "jotai";
import { addToast } from "@heroui/react";

import { getPlaylistSubscribe, getUserPlaylist, postPlaylistCreate, postPlaylistDelete } from "@/service";
import type { PlaylistCreateRequestData } from "@/service/playlist-create";
import type { PlaylistDeleteRequestData } from "@/service/playlist-delete";
import type { PlaylistInfoType } from "@/service/user-playlist";

import useUser from "./user-atom";

/**
 * 用户歌单列表
 */
export const userPlaylistAtom = atom<PlaylistInfoType[] | undefined>(undefined);

export function useUserPlaylist() {
  const [user] = useUser();
  const [playlist, setPlaylist] = useAtom(userPlaylistAtom);

  const selfCreatedPlaylist = playlist?.filter(item => item.creator?.userId === user?.userInfo?.profile?.userId);

  const collectedPlaylist = playlist?.filter(item => item.creator?.userId !== user?.userInfo?.profile?.userId);

  const refresh = async (uid: number) =>
    getUserPlaylist({
      uid,
      limit: 1000,
      offset: 0,
    }).then(({ playlist }) => {
      setPlaylist(playlist);
    });

  // 创建歌单
  const add = async (data: PlaylistCreateRequestData, cb?: VoidFunction) =>
    postPlaylistCreate(data).then(({ code, id }) => {
      if (code === 200 && id) {
        addToast({
          title: "创建成功",
          color: "success",
        });
        cb?.();
      }
    });

  // 删除歌单
  const rm = async (data: PlaylistDeleteRequestData, cb?: VoidFunction) =>
    postPlaylistDelete(data).then(({ code, id }) => {
      if (code === 200 && id) {
        addToast({
          title: "已删除",
          color: "success",
        });
        cb?.();
      }
    });

  // 收藏歌单
  const collect = (id?: number | string, cb?: VoidFunction) =>
    getPlaylistSubscribe({
      id,
      t: 1,
    }).then(({ code, id }) => {
      if (code === 200 && id) {
        addToast({
          title: "收藏成功",
          color: "success",
        });
        cb?.();
      }
    });

  const cancelCollect = (id?: number | string, cb?: VoidFunction) =>
    getPlaylistSubscribe({
      id,
      t: 2,
    }).then(({ code, id }) => {
      if (code === 200 && id) {
        addToast({
          title: "已取消收藏",
          color: "success",
        });
        cb?.();
      }
    });

  const isCollect = (pid?: number | string) => !!collectedPlaylist?.find(item => item.id === Number(pid));

  const isCreated = (pid?: number | string) => !!selfCreatedPlaylist?.find(item => item.id === Number(pid));

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
}
