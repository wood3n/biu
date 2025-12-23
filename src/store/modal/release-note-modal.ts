import type { StateCreator } from "zustand";

export interface ReleaseNoteModalState {
  isReleaseNoteModalOpen: boolean;
  onOpenReleaseNoteModal: () => void;
  onReleaseNoteModalOpenChange: (isOpen: boolean) => void;
  onCloseReleaseNoteModal: () => void;
}

export const createReleaseNoteModalSlice: StateCreator<ReleaseNoteModalState> = set => ({
  isReleaseNoteModalOpen: false,
  onOpenReleaseNoteModal: () => set({ isReleaseNoteModalOpen: true }),
  onReleaseNoteModalOpenChange: isOpen => set({ isReleaseNoteModalOpen: isOpen }),
  onCloseReleaseNoteModal: () => set({ isReleaseNoteModalOpen: false }),
});
