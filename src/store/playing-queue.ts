import { create } from "zustand";
import { persist } from "zustand/middleware";

import { PlayMode } from "@/common/constants";
import { getPlayerPagelist } from "@/service/player-pagelist";
import { getPlayerPlayurl } from "@/service/player-playurl";

import type { PlayingMV } from "./types";

interface State {
  current?: PlayingMV | null;
  list: PlayingMV[];
  // playback states (integrated from play-control)
  isPlaying: boolean;
  isMuted: boolean;
  volume: number; // 0~1
  playMode: PlayMode;
  rate: number; // 播放速率
  currentTime: number; // 当前播放时间（秒）
  duration: number; // 总时长（秒）
  // runtime audio instance (not persisted)
  audio?: HTMLAudioElement | null;
}

interface Action {
  play: (mv: PlayingMV) => Promise<void>;
  playPage: (pageCid: number) => Promise<void>;
  playList: (mvs: PlayingMV[]) => void;
  deleteMV: (bvids: string[]) => void;
  deletePage: (pageCids: number[]) => void;
  clear: () => void;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  // controls (integrated from play-control)
  togglePlay: () => Promise<void>;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
  setPlayMode: (playMode: PlayMode) => void;
  seek: (time: number) => void;
  setDuration: (duration: number) => void;
  reset: () => void;
}

const initState: State = {
  current: null,
  list: [],
  isPlaying: false,
  isMuted: false,
  volume: 0.5,
  playMode: PlayMode.Loop,
  rate: 1,
  currentTime: 0,
  duration: 0,
  audio: null,
};

const getMVPageList = async (bvid: string) => {
  const res = await getPlayerPagelist({
    bvid,
  });

  return res?.data;
};

const getAudioUrl = async (bvid: string, cid: number) => {
  const getAudioInfoRes = await getPlayerPlayurl({
    bvid,
    cid,
    fnval: 16,
  });

  const audioQualitySort = [30257, 30216, 30259, 30260, 30232, 30280, 30250, 30251];
  const audioTrackList = getAudioInfoRes?.data?.dash?.audio?.toSorted((audio, b) => {
    const indexA = audioQualitySort.indexOf(audio.id);
    const indexB = audioQualitySort.indexOf(b.id);
    // 如果 id 不在 audioQualitySort 中，则放到最后
    if (indexA === -1) return -1;
    if (indexB === -1) return 1;
    return indexB - indexA;
  });

  return audioTrackList?.[0]?.baseUrl || audioTrackList?.[0]?.backupUrl?.[0];
};

const getMVPages = async (mv: PlayingMV) => {
  const videoPageData = await getMVPageList(mv.bvid);

  if (videoPageData?.length) {
    return videoPageData.map(item => ({
      pageCid: item.cid,
      pageIndex: item.page,
      pageTitle: item.part,
      pageFirstFrameImageUrl: item.first_frame,
    }));
  }

  return [];
};

const getVideoLink = (bvid: string) => {
  return `https://www.bilibili.com/video/${bvid}`;
};

const getMVPlayData = async (mv: PlayingMV, page: number = 1) => {
  const pages = await getMVPages(mv);
  const url = await getAudioUrl(mv.bvid, pages.find(item => item.pageIndex === page)?.pageCid as number);
  return {
    ...mv,
    currentPage: page,
    videoLink: getVideoLink(mv.bvid),
    url,
    pages,
  } as PlayingMV;
};

// helper to create audio element
const createAudio = (): HTMLAudioElement => {
  const audio = new Audio();
  audio.preload = "metadata";
  audio.controls = false;
  audio.crossOrigin = "anonymous";
  return audio;
};

const audio = createAudio();

/** 播放队列 + 播放控制（整合） */
export const usePlayingQueue = create<State & Action>()(
  persist(
    (set, get) => {
      audio.onloadedmetadata = () => {
        set({ duration: audio.duration });
      };

      audio.ontimeupdate = () => {
        set({ currentTime: audio.currentTime });
      };

      audio.onplay = () => {
        set({ isPlaying: true });
      };

      audio.onpause = () => {
        set({ isPlaying: false });
      };

      audio.oncanplay = () => {
        if (get().isPlaying) {
          audio.play();
        }
      };

      audio.onended = () => {
        if (get().playMode === PlayMode.Single) {
          return;
        }
        get().next();
      };

      const setCurrentAndLoad = (mv: PlayingMV) => {
        set({ isPlaying: true, current: mv });
        if (mv?.url) {
          audio.src = mv.url;

          navigator.mediaSession.metadata = new MediaMetadata({
            title: mv.title,
            artist: mv?.singer,
            artwork: [{ src: mv.coverImageUrl as string }],
          });
          navigator.mediaSession.setActionHandler("previoustrack", () => {
            get().prev();
          });
          navigator.mediaSession.setActionHandler("nexttrack", () => {
            get().next();
          });
        }
      };

      return {
        ...initState,
        audio,

        // actions
        play: async mv => {
          const { current, list } = get();

          if (mv.bvid === current?.bvid) {
            return;
          }

          const newPlayData = await getMVPlayData(mv);
          setCurrentAndLoad(newPlayData);

          const listItem = list.find(item => item.bvid === mv.bvid);
          if (listItem) {
            set({ list: list.map(item => (item.bvid === newPlayData.bvid ? newPlayData : item)) });
          } else {
            set({ list: [newPlayData, ...list] });
          }
        },
        playList: async mvs => {
          const [first, ...rest] = mvs;
          const { current, list } = get();
          const currentListBvids = list.map(item => item.bvid);
          const newList = rest.filter(item => !currentListBvids.includes(item.bvid));

          if (first.bvid === current?.bvid) {
            const currentIndex = list.findIndex(item => item.bvid === current.bvid);

            if (newList.length) {
              set({ list: list.toSpliced(currentIndex, 0, ...newList) });
            }
            return;
          }

          const newPlayData = await getMVPlayData(first);
          setCurrentAndLoad(newPlayData);
          set({ list: [newPlayData, ...newList, ...list] });
        },
        playPage: async (pageCid: number) => {
          const { current } = get();
          if (current?.pages?.length) {
            const page = current.pages.find(item => item.pageCid === pageCid);
            if (page) {
              const url = await getAudioUrl(current.bvid, page.pageCid);
              const updated = { ...current, currentPage: page.pageIndex, url } as PlayingMV;
              setCurrentAndLoad(updated);
            }
          }
        },
        next: async () => {
          const { list, current } = get();

          if (current?.pages?.length && current.currentPage < current.pages.length) {
            const nextPageIndex = current.currentPage + 1;
            const nextPage = current.pages.find(item => item.pageIndex === nextPageIndex);
            if (nextPage) {
              const url = await getAudioUrl(current.bvid, nextPage.pageCid);

              const updated = { ...current, currentPage: nextPageIndex, url } as PlayingMV;
              setCurrentAndLoad(updated);
              return;
            }
          }

          const currentMVIndex = list.findIndex(item => item.bvid === current?.bvid) || 0;
          let nextIndex = currentMVIndex + 1;
          if (nextIndex >= list.length) {
            nextIndex = 0;
          }

          const nextItem = list[nextIndex];
          const newPlayData = await getMVPlayData(nextItem);
          setCurrentAndLoad(newPlayData);
        },
        prev: async () => {
          const { list, current } = get();
          if (current?.pages?.length && current.currentPage > 1) {
            const prevPageIndex = current.currentPage - 1;
            const prevPage = current.pages.find(item => item.pageIndex === prevPageIndex);
            if (prevPage) {
              const url = await getAudioUrl(current.bvid, prevPage.pageCid);
              const updated = { ...current, currentPage: prevPageIndex, url } as PlayingMV;
              setCurrentAndLoad(updated);
              return;
            }
          }

          const currentMVIndex = list.findIndex(item => item.bvid === current?.bvid) || 0;
          let prevIndex = currentMVIndex - 1;
          if (prevIndex < 0) {
            prevIndex = list.length - 1; // 如果不是循环模式且已是最后一首，保持当前歌曲
          }

          const prevItem = list[prevIndex];

          if (prevItem.url) {
            setCurrentAndLoad(prevItem);
          } else {
            const newPlayData = await getMVPlayData(prevItem);
            setCurrentAndLoad(newPlayData);
          }
        },
        deleteMV: bvids => {
          set(state => {
            return { list: state.list.filter(item => !bvids.includes(item.bvid)) };
          });
        },
        deletePage: pageCids => {
          const { current } = get();
          set({
            current: {
              ...(current as PlayingMV),
              pages: current?.pages?.filter(item => !pageCids.includes(item.pageCid)),
            },
          });
        },
        clear: () => {
          audio.src = "";
          set({ list: [], current: null, isPlaying: false, duration: 0, currentTime: 0 });
        },
        togglePlay: async () => {
          const { isPlaying } = get();
          if (isPlaying) {
            audio.pause();
          } else {
            audio.play();
          }
        },
        toggleMute: () => {
          const value = !get().isMuted;
          audio.muted = value;
          set({ isMuted: value });
        },
        setVolume: (volume: number) => {
          const v = Math.max(0, Math.min(1, volume));
          audio.volume = v;
          set({ volume: v });
        },
        setRate: (rate: number) => {
          audio.playbackRate = rate;
          set({ rate });
        },
        setPlayMode: playMode => {
          set({ playMode });
          if (playMode === PlayMode.Single) {
            audio.loop = true;
          } else {
            audio.loop = false;
          }
        },
        seek: (time: number) => {
          audio.currentTime = time;
        },
        setDuration: (duration: number) => {
          set({ duration });
        },
        reset: () => {
          audio.src = "";
          set({ isPlaying: false, duration: 0, currentTime: 0 });
        },
      };
    },
    {
      name: "playing-queue",
      partialize: state => ({
        current: state.current,
        list: state.list,
        // control states
        volume: state.volume,
        playMode: state.playMode,
        isMuted: state.isMuted,
        rate: state.rate,
        currentTime: state.currentTime,
      }),
      onRehydrateStorage: () => {
        return state => {
          const { volume, isMuted, rate, currentTime, current, playMode } = state || initState;
          audio.volume = volume;
          if (isMuted) {
            audio.muted = true;
          }
          audio.playbackRate = rate;
          audio.currentTime = currentTime;

          if (playMode === PlayMode.Single) {
            audio.loop = true;
          }

          if (current?.url) {
            audio.src = current.url;
          }
        };
      },
    },
  ),
);
