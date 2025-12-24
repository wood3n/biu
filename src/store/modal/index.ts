import { create } from "zustand";

import { createConfirmModalSlice, type ConfirmModalState } from "./confirm-modal";
import { createFavSelectModalSlice, type FavSelectModalState } from "./fav-select-modal";
import { createFullScreenPlayerSlice, type FullScreenPlayerModalState } from "./full-screen-player";
import { createPlayListDrawerSlice, type PlayListDrawerState } from "./play-list-drawer";
import { createReleaseNoteModalSlice, type ReleaseNoteModalState } from "./release-note-modal";
import { createVideoPageDownloadModalSlice, type VideoPageDownloadModalState } from "./video-page-download-modal";

export const useModalStore = create<
  FavSelectModalState &
    ConfirmModalState &
    VideoPageDownloadModalState &
    ReleaseNoteModalState &
    FullScreenPlayerModalState &
    PlayListDrawerState
>((...a) => ({
  ...createFavSelectModalSlice(...a),
  ...createConfirmModalSlice(...a),
  ...createVideoPageDownloadModalSlice(...a),
  ...createReleaseNoteModalSlice(...a),
  ...createFullScreenPlayerSlice(...a),
  ...createPlayListDrawerSlice(...a),
}));
