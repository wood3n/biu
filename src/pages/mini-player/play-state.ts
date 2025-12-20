import { create } from "zustand";

import type { PlayMode } from "@/common/constants/audio";

interface State {
  isPlaying: boolean;
  isSingle: boolean;
  title?: string;
  cover?: string;
  duration: number;
  playMode?: PlayMode;
}

interface Action {
  update: (state: State) => void;
}

export const usePlayState = create<State & Action>(set => ({
  isPlaying: false,
  isSingle: false,
  duration: 0,
  update: state => set(state),
}));
