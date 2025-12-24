import type { StateCreator } from "zustand";

export interface FullScreenPlayerModalState {
  isFullScreenPlayerOpen: boolean;
  openFullScreenPlayer: () => void;
  closeFullScreenPlayer: () => void;
}

export const createFullScreenPlayerSlice: StateCreator<FullScreenPlayerModalState> = set => ({
  isFullScreenPlayerOpen: false,
  openFullScreenPlayer: () => set({ isFullScreenPlayerOpen: true }),
  closeFullScreenPlayer: () => set({ isFullScreenPlayerOpen: false }),
});
