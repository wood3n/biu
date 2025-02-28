import { create } from "zustand";

import { PlaylistSpecialType } from "@/common/constants";
import { getUserPlaylist, type PlaylistInfoType } from "@/service/user-playlist";

interface State {
  likeList?: PlaylistInfoType | null;
  createList?: PlaylistInfoType[];
  collectList?: PlaylistInfoType[];
}

interface Action {
  updatePlayList: (userId: number) => Promise<void>;
}

export const useUserPlayList = create<State & Action>(set => ({
  likeList: null,
  updatePlayList: async userId => {
    const response = await getUserPlaylist({
      uid: userId,
      limit: 1000,
      offset: 0,
    });

    const likeList = response?.playlist?.find(item => item.specialType === PlaylistSpecialType.Favorite);
    const createList = response?.playlist?.filter(item => item.specialType !== PlaylistSpecialType.Favorite && item.userId === userId);
    const collectList = response?.playlist?.filter(item => item.specialType !== PlaylistSpecialType.Favorite && item.userId !== userId);
    set(() => ({ likeList, createList, collectList }));
  },
}));
