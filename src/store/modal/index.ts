import { create } from "zustand";

import { createConfirmModalSlice, type ConfirmModalState } from "./confirm-modal";
import { createFavSelectModalSlice, type FavSelectModalState } from "./fav-select-modal";
import { createFullScreenPlayerSlice, type FullScreenPlayerModalState } from "./full-screen-player";
import { createImagePreviewSlice, type ImagePreviewState } from "./image-preview";
import { createPlayListDrawerSlice, type PlayListDrawerState } from "./play-list-drawer";
import { createReleaseNoteModalSlice, type ReleaseNoteModalState } from "./release-note-modal";
import { createVideoPageDownloadModalSlice, type VideoPageDownloadModalState } from "./video-page-download-modal";

export type { ConfirmModalData } from "./confirm-modal";
export type { FavSelectModalData } from "./fav-select-modal";
export type { ImagePreviewData } from "./image-preview";

export const useModalStore = create<
  FavSelectModalState &
    ConfirmModalState &
    VideoPageDownloadModalState &
    ReleaseNoteModalState &
    FullScreenPlayerModalState &
    PlayListDrawerState &
    ImagePreviewState
>((...a) => ({
  ...createFavSelectModalSlice(...a),
  ...createConfirmModalSlice(...a),
  ...createVideoPageDownloadModalSlice(...a),
  ...createReleaseNoteModalSlice(...a),
  ...createFullScreenPlayerSlice(...a),
  ...createPlayListDrawerSlice(...a),
  ...createImagePreviewSlice(...a),
}));
