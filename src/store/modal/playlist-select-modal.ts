import type { ReactNode } from "react";

import type { StateCreator } from "zustand";

import type { PlayItem } from "@/store/play-list";

export interface PlaylistSelectModalData {
  songs: PlayItem[];
  title?: ReactNode;
  onSuccess?: (playlistId: string) => void;
}

export interface PlaylistSelectModalState {
  isPlaylistSelectModalOpen: boolean;
  playlistSelectModalData: PlaylistSelectModalData | null;
  onOpenPlaylistSelectModal: (data: PlaylistSelectModalData) => void;
  onPlaylistSelectModalOpenChange: (isOpen: boolean) => void;
  onClosePlaylistSelectModal: () => void;
}

export const createPlaylistSelectModalSlice: StateCreator<PlaylistSelectModalState> = set => ({
  isPlaylistSelectModalOpen: false,
  playlistSelectModalData: null,
  onOpenPlaylistSelectModal: data => set({ isPlaylistSelectModalOpen: true, playlistSelectModalData: data }),
  onPlaylistSelectModalOpenChange: isOpen => set({ isPlaylistSelectModalOpen: isOpen }),
  onClosePlaylistSelectModal: () => set({ isPlaylistSelectModalOpen: false }),
});
