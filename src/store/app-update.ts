import { create } from "zustand";

interface AppUpdateActions {
  setUpdate: (updateInfo: CheckAppUpdateResult) => void;
}

export const useAppUpdateStore = create<CheckAppUpdateResult & AppUpdateActions>(set => ({
  isUpdateAvailable: false,
  setUpdate: updateInfo =>
    set(state => ({
      ...state,
      ...updateInfo,
    })),
}));
