import { create } from "zustand";

import type { PlayMode } from "@/common/constants/audio";

interface State {
  isPlaying: boolean;
  isSingle: boolean;
  title?: string;
  cover?: string;
  currentTime: number;
  duration: number;
  playMode?: PlayMode;
}

interface Action {
  update: (state: State) => void;
}

export const usePlayState = create<State & Action>(set => ({
  isPlaying: false,
  isSingle: false,
  currentTime: 0,
  duration: 0,
  update: state => set(state),
}));
