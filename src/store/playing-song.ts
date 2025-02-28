import { create } from "zustand";

interface State {
  playingSong: Song | null | undefined;
}

interface Action {
  update: (song: Song) => Promise<void>;
}

/** 当前歌曲 */
export const usePlayingSong = create<State & Action>(set => ({
  playingSong: null,
  update: async song => {
    set(() => ({ playingSong: song }));
  },
}));
