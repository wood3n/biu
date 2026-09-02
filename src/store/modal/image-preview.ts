import type { StateCreator } from "zustand";

export interface ImagePreviewData {
  /** 原图地址 */
  url: string;
  alt?: string;
}

export interface ImagePreviewState {
  imagePreviewData: ImagePreviewData | null;
  onOpenImagePreview: (data: ImagePreviewData) => void;
  onCloseImagePreview: () => void;
}

export const createImagePreviewSlice: StateCreator<ImagePreviewState> = set => ({
  imagePreviewData: null,
  onOpenImagePreview: data => set({ imagePreviewData: data }),
  onCloseImagePreview: () => set({ imagePreviewData: null }),
});
