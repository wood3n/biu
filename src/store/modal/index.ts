import { create } from "zustand";

import { createConfirmModalSlice, type ConfirmModalState } from "./confirm-modal";
import { createFavSelectModalSlice, type FavSelectModalState } from "./fav-select-modal";
import { createReleaseNoteModalSlice, type ReleaseNoteModalState } from "./release-note-modal";
import { createVideoPageDownloadModalSlice, type VideoPageDownloadModalState } from "./video-page-download-modal";

export const useModalStore = create<
  FavSelectModalState & ConfirmModalState & VideoPageDownloadModalState & ReleaseNoteModalState
>((...a) => ({
  ...createFavSelectModalSlice(...a),
  ...createConfirmModalSlice(...a),
  ...createVideoPageDownloadModalSlice(...a),
  ...createReleaseNoteModalSlice(...a),
}));
