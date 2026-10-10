import { create } from "zustand";

interface LyricsSearchState {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

/** 全局歌词搜索弹窗：桌面歌词窗口可以通过它唤起主界面的「搜索歌词」 */
export const useLyricsSearchStore = create<LyricsSearchState>(set => ({
  isOpen: false,
  setOpen: open => set({ isOpen: open }),
}));
