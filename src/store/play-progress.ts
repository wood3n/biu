import { create } from "zustand";

interface ProgressState {
  currentTime: number;
  setCurrentTime: (time: number) => void;
  initCurrentTime: () => number;
  saveCurrentTime: () => void;
}

export const usePlayProgress = create<ProgressState>((set, get) => ({
  currentTime: 0,
  initCurrentTime: () => {
    const localStorageTime = localStorage.getItem("play-current-time");
    if (localStorageTime) {
      const time = Number(localStorageTime);
      set({ currentTime: time });
      return time;
    }

    return 0;
  },
  saveCurrentTime: () => {
    if (get().currentTime) {
      localStorage.setItem("play-current-time", get().currentTime.toString());
    }
  },
  setCurrentTime: (time: number) => set({ currentTime: time }),
}));
