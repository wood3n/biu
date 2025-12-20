import { create } from "zustand";

interface ProgressState {
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

export const usePlayProgress = create<ProgressState>(set => ({
  currentTime: 0,
  setCurrentTime: (time: number) => set({ currentTime: time }),
}));
