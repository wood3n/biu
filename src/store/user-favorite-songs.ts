import { create } from "zustand";

import { getLikeList } from "@/service";

interface State {
  songs: number[] | null | undefined;
}

interface Action {
  updateFavoriteSongs: (userId: number) => Promise<void>;
}

export const useFavoriteSongs = create<State & Action>(set => ({
  songs: null,
  updateFavoriteSongs: async userId => {
    const response = await getLikeList({
      uid: userId,
    });

    set(() => ({ songs: response?.ids }));
  },
}));
