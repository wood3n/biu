import { create } from "zustand";
import { persist } from "zustand/middleware";

import { downloadByUrl } from "@/common/utils";
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
  });

  const videoQualitySort = [6, 16, 32, 64, 74, 80, 100, 112, 116, 120, 125, 126, 127];
  const videoTrackList = getAudioInfoRes?.data?.dash?.video?.toSorted((video, b) => {
    const indexA = videoQualitySort.indexOf(video.id);
    const indexB = videoQualitySort.indexOf(b.id);
    // 如果 id 不在 videoQualitySort 中，则放到最后
    if (indexA === -1) return -1;
    if (indexB === -1) return 1;
    return indexB - indexA;
  });

  return videoTrackList?.[0]?.baseUrl || videoTrackList?.[0]?.backupUrl?.[0];
};

export const useDownloadQueue = create<DownloadState & DownloadAction>()(
  persist(
    (set, get) => ({
      list: [],
      add: async item => {
        const url = await getVideoUrl(item);

        if (url) {
          console.log(url);
          downloadByUrl(url);
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
