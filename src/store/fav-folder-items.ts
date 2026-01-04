import { create } from "zustand";

import type { FavMedia } from "@/service/fav-resource";

interface State {
  items: FavMedia[];
}

interface Action {
  setItems: (items: FavMedia[]) => void;
  appendItems: (items: FavMedia[]) => void;
  removeItem: (id: number) => void;
  clearItems: () => void;
}

export const useFavFolderItemsStore = create<State & Action>()(set => ({
  items: [],
  setItems: items => set({ items }),
  appendItems: items =>
    set(state => ({
      items: [...state.items, ...items],
    })),
  removeItem: id =>
    set(state => ({
      items: state.items.filter(item => item.id !== id),
    })),
  clearItems: () => set({ items: [] }),
}));
