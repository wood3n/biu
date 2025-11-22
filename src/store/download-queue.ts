import { addToast } from "@heroui/react";
import { uniqueId } from "es-toolkit/compat";
import moment from "moment";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getMVUrl } from "@/common/utils/audio";
import { sanitizeFilename } from "@/common/utils/file";

interface DownloadParams {
  title: string;
  coverImgUrl: string;
  bvid: string;
  cid: string;
  type?: "video" | "audio";
}

interface DownloadItem extends DownloadParams {
  id: string;
  audioUrl: string;
  videoUrl?: string;
  filename?: string;
  totalBytes?: number;
  downloadedBytes?: number;
  progress?: number; // 0-100
  createTime?: number;
  status?: DownloadStatus;
  error?: string;
}

interface DownloadState {
  list: DownloadItem[];
}

interface DownloadAction {
  add: (item: DownloadParams) => Promise<void>;
  addList: (items: DownloadParams[]) => Promise<void>;
  remove: (id: string) => void;
  clear: () => void;
  updateProgress: (id: string, progress: number) => void;
}

let subscribed = false;

export const useDownloadQueue = create<DownloadState & DownloadAction>()(
  persist(
    (set, get) => ({
      list: [],
      add: async ({ type = "audio", title, coverImgUrl, bvid, cid }) => {
        const exists = get().list.some(i => i.bvid === bvid && i.cid === cid && i.status !== "completed");
        if (exists) {
          addToast({
            title: "当前音频正在下载中",
            color: "warning",
          });
          return;
        }

        const { audioUrl, isLossless } = await getMVUrl(bvid, cid);
        const filename = `${sanitizeFilename(title)}_${bvid}_${cid}.${isLossless ? "flac" : "mp3"}`;
        const fileExists = await window.electron.checkFileExists(filename);
        if (fileExists) {
          addToast({
            title: "文件已存在",
            color: "warning",
          });
          return;
        }

        const id = `${Date.now()}_${uniqueId()}`;
        const createTime = moment().unix();
        // 先入队为 waiting
        set(state => ({
          list: [
            ...state.list,
            {
              id,
              type,
              title,
              bvid,
              cid,
              coverImgUrl,
              audioUrl: audioUrl as string,
              status: "waiting",
              progress: 0,
              createTime,
            },
          ],
        }));

        addToast({
          title: "已添加下载任务",
          color: "success",
        });

        // 启动下载
        try {
          await window.electron.startDownload({ id, filename, audioUrl: audioUrl as string, isLossless });
          set(state => ({
            list: state.list.map(i => (i.id === id ? { ...i, status: "downloading" } : i)),
          }));
        } catch (e) {
          set(state => ({
            list: state.list.map(i => (i.id === id ? { ...i, status: "failed", error: String(e) } : i)),
          }));
        }

        // 仅注册一次进度监听
        if (!subscribed) {
          subscribed = true;
          try {
            await window.electron.onDownloadProgress(({ id, downloadedBytes, totalBytes, progress, status, error }) => {
              set(state => ({
                list: state.list.map(i => {
                  if (i.id !== id) return i;

                  if (status === "downloading") {
                    return {
                      ...i,
                      downloadedBytes,
                      totalBytes,
                      progress,
                    };
                  }

                  if (status === "merging") {
                    return { ...i, status };
                  }

                  if (status === "completed") {
                    return { ...i, status, progress: 100 };
                  }

                  if (status === "failed") {
                    return { ...i, status, error };
                  }

                  return i;
                }),
              }));
            });
          } catch {
            // ignore subscribe errors
          }
        }
      },
      addList: async items => {
        for (const item of items) {
          await get().add(item);
        }
      },
      remove: id =>
        set(state => ({
          list: state.list.filter(i => i.id !== id),
        })),
      clear: () => set({ list: [] }),
      updateProgress: (id, progress) =>
        set(state => ({
          list: state.list.map(i => (i.id === id ? { ...i, progress } : i)),
        })),
    }),
    {
      name: "download-queue",
      partialize: state => ({ list: state.list }),
    },
  ),
);
