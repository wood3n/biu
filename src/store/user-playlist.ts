import { create } from "zustand";

import { getUserPlaylist, type PlaylistInfoType } from "@/service/user-playlist";

interface State {
  playList: PlaylistInfoType[] | null | undefined;
}

interface Action {
  updatePlayList: (userId: number) => Promise<void>;
}

export const useUserPlayList = create<State & Action>(set => ({
  playList: null,
  updatePlayList: async userId => {
    const response = await getUserPlaylist({
      uid: userId,
      limit: 1000,
      offset: 0,
    });

    set(() => ({ playList: response?.playlist }));
  },
}));
