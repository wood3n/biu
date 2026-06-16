import { create } from "zustand";

interface LocateLocalSongState {
  /** 待定位的本地歌曲 id；每次请求自增 nonce，使重复点击同一首也能再次触发 */
  targetId: string | null;
  nonce: number;
  request: (id: string) => void;
  clear: () => void;
}

/**
 * 左下角播放栏（全局）与本地音乐页（按路由挂载）之间的解耦通道：
 * 播放栏写入定位请求，本地音乐页订阅后滚动到对应行。
 */
export const useLocateLocalSong = create<LocateLocalSongState>(set => ({
  targetId: null,
  nonce: 0,
  request: id => set(s => ({ targetId: id, nonce: s.nonce + 1 })),
  clear: () => set({ targetId: null }),
}));
