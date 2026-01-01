import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SearchItem {
  value: string;
  time: number;
}

export interface SearchHistoryState {
  keyword: string;
  items: SearchItem[];
}

export interface SearchHistoryAction {
  add: (value: string) => void;
  delete: (item: SearchItem) => void;
  clear: () => void;
}

export const useSearchHistory = create<SearchHistoryState & SearchHistoryAction>()(
  persist(
    (set, get) => ({
      keyword: "",
      items: [],
      add: value => {
        const { items } = get();
        const newItem = { value, time: Date.now() };

        if (items.some(i => i.value === value)) {
          set({ keyword: value, items: [newItem, ...items.filter(i => i.value !== value)] });
        } else {
          set({ keyword: value, items: [newItem, ...items] });
        }
      },
      delete: item => set(state => ({ items: state.items.filter(i => i.value !== item.value) })),
      clear: () => set({ keyword: "", items: [] }),
    }),
    {
      name: "search-history",
      partialize: state => ({ keyword: state.keyword, items: state.items }),
    },
  ),
);
