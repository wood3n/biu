import { create } from "zustand";
import { persist } from "zustand/middleware";

import { VideoQuality } from "@/common/constants/video";
import { getPlayerPlayurl } from "@/service/player-playurl";

interface DownloadItem {
  bvid: string;
  cid: number;
  title: string;
  cover: string;
  duration: number;
  url?: string;
  progress?: number;
  status?: "downloading" | "paused" | "completed" | "failed";
  error?: string;
}

interface DownloadState {
  list: DownloadItem[];
}

interface DownloadAction {
  add: (item: DownloadItem) => Promise<void>;
  addList: (items: DownloadItem[]) => Promise<void>;
  remove: (item: DownloadItem) => void;
  updateProgress: (id: string, progress: number) => void;
}

const getVideoUrl = async (item: DownloadItem) => {
  const getAudioInfoRes = await getPlayerPlayurl({
    bvid: item.bvid,
    cid: item.cid,
    fnval: 1,
    qn: VideoQuality.Q1080P,
  });

  return getAudioInfoRes?.data?.durl?.[0]?.url || getAudioInfoRes?.data?.durl?.[0]?.backup_url?.[0];
};

export const useDownloadQueue = create<DownloadState & DownloadAction>()(
  persist(
    (set, get) => ({
      list: [],
      add: async item => {
        const url = await getVideoUrl(item);

        if (url) {
          set(state => ({ list: [...state.list, { ...item, url, status: "downloading", progress: 0 }] }));
        } else {
          set(state => ({ list: [...state.list, { ...item, status: "failed", error: "获取视频地址失败" }] }));
        }
      },
      addList: async items => {
        for (const item of items) {
          await get().add(item);
        }
      },
      remove: item =>
        set(state => ({
          list: state.list.filter(i => i.bvid !== item.bvid),
        })),
      updateProgress: (id, progress) =>
        set(state => ({
          list: state.list.map(i => (i.bvid === id ? { ...i, progress } : i)),
        })),
    }),
    {
      name: "download-queue",
      partialize: state => ({ list: state.list }),
    },
  ),
);
