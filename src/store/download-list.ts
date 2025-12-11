import { create } from "zustand";

import { getAudioUrl, getDashUrl } from "@/common/utils/audio";

export interface State {
  list: MediaDownloadTask[];
}

export interface Action {
  add: (media: MediaDownloadTask) => void;
  addList: (mediaList: MediaDownloadTask[]) => void;
  pause: (id: string) => void;
  resume: (id: string) => void;
  retry: (id: string) => void;
  cancel: (id: string) => void;
  restoreList: () => Promise<void>;
  updateList: (list: MediaDownloadTask[]) => void;
}

const getDownloadInfo = async (media: MediaDownloadTask) => {
  if (media.sid) {
    const musicData = await getAudioUrl(media.sid);

    return {
      audioUrl: musicData.audioUrl,
      audioCodecs: musicData.audioCodecs,
    };
  }

  const dashData = await getDashUrl(media.bvid as string, media.cid as string);

  return {
    audioUrl: dashData.audioUrl,
    audioCodecs: dashData.audioCodecs,
    audioBandwidth: dashData.audioBandwidth,
    videoUrl: dashData.videoUrl,
    videoBandwidth: dashData.videoResolution,
  };
};

export const useDownloadStore = create<State & Action>()(set => ({
  list: [],

  add: media => {
    window.electron.addMediaDownloadTask(media);
  },

  addList: mediaList => {
    mediaList.forEach(media => {
      window.electron.addMediaDownloadTask(media);
    });
  },

  cancel: id => {
    window.electron.cancelMediaDownloadTask(id);
  },

  pause: id => {
    window.electron.pauseMediaDownloadTask(id);
  },

  resume: id => {
    window.electron.resumeMediaDownloadTask(id);
  },

  retry: id => {
    window.electron.retryMediaDownloadTask(id);
  },

  restoreList: async () => {
    const list = await window.electron.getMediaDownloadTaskList();
    if (list) {
      set({ list });
    }
  },

  updateList: list => {
    set({ list });
  },
}));
