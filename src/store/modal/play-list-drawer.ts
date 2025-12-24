import type { StateCreator } from "zustand";

export interface PlayListDrawerState {
  isPlayListDrawerOpen: boolean;
  openPlayListDrawer: () => void;
  closePlayListDrawer: () => void;
  setPlayListDrawerOpen: (isOpen: boolean) => void;
}

export const createPlayListDrawerSlice: StateCreator<PlayListDrawerState> = set => ({
  isPlayListDrawerOpen: false,
  openPlayListDrawer: () => set({ isPlayListDrawerOpen: true }),
  closePlayListDrawer: () => set({ isPlayListDrawerOpen: false }),
  setPlayListDrawerOpen: (isOpen: boolean) => set({ isPlayListDrawerOpen: isOpen }),
});
