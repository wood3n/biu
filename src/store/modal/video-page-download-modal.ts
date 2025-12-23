import type { StateCreator } from "zustand";

interface DownloadData {
  outputFileType: MediaDownloadOutputFileType;
  title: string;
  cover?: string;
  bvid: string;
}

export interface VideoPageDownloadModalState {
  videoPageDownloadModalData: DownloadData | null;
  isVideoPageDownloadModalOpen: boolean;
  onOpenVideoPageDownloadModal: (data: DownloadData) => void;
  onVideoPageDownloadModalOpenChange: (isOpen: boolean) => void;
  onCloseVideoPageDownloadModal: () => void;
}

export const createVideoPageDownloadModalSlice: StateCreator<VideoPageDownloadModalState> = set => ({
  videoPageDownloadModalData: null,
  isVideoPageDownloadModalOpen: false,
  onOpenVideoPageDownloadModal: data => set({ isVideoPageDownloadModalOpen: true, videoPageDownloadModalData: data }),
  onVideoPageDownloadModalOpenChange: isOpen => set({ isVideoPageDownloadModalOpen: isOpen }),
  onCloseVideoPageDownloadModal: () => set({ isVideoPageDownloadModalOpen: false }),
});
