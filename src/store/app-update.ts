import { create } from "zustand";

interface AppUpdateState {
  hasUpdate: boolean;
  isDownloaded: boolean;
  latestVersion?: string;
  releaseNotes?: string;
}

interface AppUpdateActions {
  setUpdate: (updateInfo: AppUpdateState) => void;
}

export const useAppUpdateStore = create<AppUpdateState & AppUpdateActions>(set => ({
  hasUpdate: false,
  isDownloaded: false,
  setUpdate: updateInfo =>
    set({
      hasUpdate: updateInfo.hasUpdate,
      isDownloaded: updateInfo.isDownloaded,
      latestVersion: updateInfo.latestVersion,
      releaseNotes: updateInfo.releaseNotes,
    }),
}));
