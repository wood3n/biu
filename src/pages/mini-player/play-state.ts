import { create } from "zustand";

import type { PlayMode } from "@/common/constants/audio";

interface LyricLine {
  time: number; // milliseconds
  text: string;
}

interface State {
  isPlaying: boolean;
  isSingle: boolean;
  title?: string;
  cover?: string;
  ownerName?: string;
  bvid?: string;
  cid?: string;
  lyrics: LyricLine[];
  duration: number;
  playMode?: PlayMode;
}

interface Action {
  update: (state: State) => void;
}

export const usePlayState = create<State & Action>(set => ({
  isPlaying: false,
  isSingle: false,
  lyrics: [],
  duration: 0,
  update: state => set(state),
}));
