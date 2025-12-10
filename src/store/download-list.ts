import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware/persist";

export interface State {
  list: MediaDownloadTask[];
}

export interface Action {
  add: (media: MediaDownloadParams) => void;
  addList: (mediaList: MediaDownloadParams[]) => void;
  pause: (id: string) => void;
  resume: (id: string) => void;
  retry: (id: string) => void;
  cancel: (id: string) => void;
}

export const useDownloadStore = create<State & Action>()(
  persist(
    immer((set, get) => ({
      list: [],

      add: media => set(state => { }),

      addList: mediaList => set(state => { }),

      cancel: id =>
        set(state => {
          state.list = state.list.filter(item => item.id !== id);
        }),

      pause: id => set(state => { }),

      resume: id => set(state => { }),

      retry: id => set(state => { }),
    })),
    {
      name: "download-list",
      partialize: state => ({ list: state.list }),
    },
  ),
);
