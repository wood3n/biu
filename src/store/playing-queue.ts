import moment from "moment";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { PlayMode } from "@/common/constants";
import { getMVUrl } from "@/common/utils/audio";
import { getPlayerPagelist } from "@/service/player-pagelist";

import type { PlayingMV } from "./types";

import { usePlayerControls } from "./player-controls";

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
  expiredTime?: number; // url过期时间（秒）
  isLossless?: boolean; // 是否为无损音频
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
  addToNext: (mv: PlayingMV) => void;

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

const getMVPages = async (mv: PlayingMV) => {
  const getPageRes = await getPlayerPagelist({
    bvid: mv.bvid,
  });

  if (getPageRes?.data?.length) {
    return getPageRes.data.map(item => ({
      pageCid: item.cid,
      pageIndex: item.page,
      pageTitle: item.part,
      pageFirstFrameImageUrl: item.first_frame,
      pageDuration: item.duration,
    }));
  }

  return [];
};

const getVideoLink = (bvid: string) => `https://www.bilibili.com/video/${bvid}`;

const getMVPlayData = async (mv: PlayingMV, page: number = 1) => {
  const pages = await getMVPages(mv);
  const cid = pages.find(item => item.pageIndex === page)?.pageCid as number;
  const { audioUrl, expiredTime, isLossless } = await getMVUrl(mv.bvid, cid);
  return {
    ...mv,
    isLossless,
    currentPage: page,
    cid,
    videoLink: getVideoLink(mv.bvid),
    url: audioUrl,
    expiredTime,
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
      // 初始化 audio 属性来自独立的 player-controls 状态
      const controlsInit = usePlayerControls.getState();
      audio.volume = (controlsInit.volume ?? 50) / 100;
      audio.muted = controlsInit.isMuted ?? false;
      audio.playbackRate = controlsInit.rate ?? 1;
      audio.currentTime = Math.floor((controlsInit.currentTime ?? 0) / 1000);
      audio.loop = (controlsInit.playMode ?? PlayMode.Loop) === PlayMode.Single;

      // 订阅控制状态变化以同步 audio 属性和本地镜像字段（isPlaying 由 audio 事件驱动）
      usePlayerControls.subscribe(state => {
        audio.volume = (state.volume ?? 50) / 100;
        audio.muted = state.isMuted ?? false;
        audio.playbackRate = state.rate ?? 1;
        audio.loop = (state.playMode ?? PlayMode.Loop) === PlayMode.Single;
        set({
          isMuted: state.isMuted,
          volume: (state.volume ?? 50) / 100,
          playMode: state.playMode,
          rate: state.rate,
        });
      });

      audio.onloadedmetadata = () => {
        // 同步总时长（秒 & 毫秒）
        usePlayerControls.setState({ duration: Math.round(audio.duration * 1000) });
        set({ duration: audio.duration });
      };

      audio.ontimeupdate = () => {
        // 同步当前时间（秒 & 毫秒）
        usePlayerControls.setState({ currentTime: Math.round(audio.currentTime * 1000) });
        set({ currentTime: audio.currentTime });
      };

      audio.onplay = () => {
        usePlayerControls.setState({ isPlaying: true });
        set({ isPlaying: true });
      };

      audio.onpause = () => {
        usePlayerControls.setState({ isPlaying: false });
        set({ isPlaying: false });
      };

      audio.oncanplay = () => {
        // 根据控制状态决定是否自动播放
        if (usePlayerControls.getState().isPlaying) {
          audio.play();
        }
      };

      audio.onended = () => {
        if (usePlayerControls.getState().playMode === PlayMode.Single) {
          return;
        }
        get().next();
      };

      const setCurrentAndLoad = (mv: PlayingMV) => {
        // 切歌即视为播放开始
        usePlayerControls.setState({ isPlaying: true });
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
        // 镜像初始控制状态（保持对现有 UI 的兼容）
        isPlaying: controlsInit.isPlaying,
        isMuted: controlsInit.isMuted,
        volume: (controlsInit.volume ?? 50) / 100,
        playMode: controlsInit.playMode,
        rate: controlsInit.rate,
        currentTime: Math.floor((controlsInit.currentTime ?? 0) / 1000),
        duration: Math.floor((controlsInit.duration ?? 0) / 1000),
        audio,

        // actions
        play: async mv => {
          const { current, list } = get();

          if (mv.bvid === current?.bvid) {
            return;
          }

          let newPlayData: PlayingMV;
          if (mv.cid) {
            const { audioUrl, expiredTime, isLossless } = await getMVUrl(mv.bvid, mv.cid);
            newPlayData = { ...mv, url: audioUrl, expiredTime, isLossless };
          } else {
            newPlayData = await getMVPlayData(mv);
          }
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
          const { current } = get();

          if (first.bvid === current?.bvid) {
            set({ list: [...mvs] });
          } else {
            const newPlayData = await getMVPlayData(first);
            setCurrentAndLoad(newPlayData);
            set({ current: newPlayData, list: [newPlayData, ...rest] });
          }
        },
        playPage: async (pageCid: number) => {
          const { current } = get();
          if (current?.pages?.length) {
            const page = current.pages.find(item => item.pageCid === pageCid);
            if (page) {
              const { audioUrl, expiredTime, isLossless } = await getMVUrl(current.bvid, page.pageCid);
              const updated = {
                ...current,
                currentPage: page.pageIndex,
                url: audioUrl,
                expiredTime,
                isLossless,
              } as PlayingMV;
              setCurrentAndLoad(updated);
            }
          }
        },
        next: async () => {
          const { list, current } = get();

          if (current?.pages?.length && (current.currentPage ?? 1) < current.pages.length) {
            const nextPageIndex = (current.currentPage ?? 1) + 1;
            const nextPage = current.pages.find(item => item.pageIndex === nextPageIndex);
            if (nextPage) {
              const { audioUrl, expiredTime, isLossless } = await getMVUrl(current.bvid, nextPage.pageCid);

              const updated = {
                ...current,
                currentPage: nextPageIndex,
                url: audioUrl,
                expiredTime,
                isLossless,
              } as PlayingMV;
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
          if (current?.pages?.length && (current.currentPage ?? 1) > 1) {
            const prevPageIndex = (current.currentPage ?? 1) - 1;
            const prevPage = current.pages.find(item => item.pageIndex === prevPageIndex);
            if (prevPage) {
              const { audioUrl, expiredTime, isLossless } = await getMVUrl(current.bvid, prevPage.pageCid);
              const updated = {
                ...current,
                currentPage: prevPageIndex,
                url: audioUrl,
                expiredTime,
                isLossless,
              } as PlayingMV;
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
        addToNext: async mv => {
          const { current, list } = get();
          if (current) {
            const currentIndex = list.findIndex(item => item.bvid === current?.bvid);
            const filteredList = list.filter(item => item.bvid !== mv.bvid);

            set({ list: [...filteredList.slice(0, currentIndex), mv, ...filteredList.slice(currentIndex)] });
          } else {
            const newPlayData = await getMVPlayData(mv);
            setCurrentAndLoad(newPlayData);
            set({ list: [newPlayData, ...list] });
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
          usePlayerControls.setState({ isPlaying: false, duration: 0, currentTime: 0 });
          set({ list: [], current: null, isPlaying: false, duration: 0, currentTime: 0 });
          usePlayerControls.setState({
            isPlaying: false,
            duration: 0,
            currentTime: 0,
          });
        },
        togglePlay: async () => {
          const { isPlaying } = usePlayerControls.getState();
          if (isPlaying) {
            audio.pause();
          } else {
            audio.play();
          }
        },
        toggleMute: () => {
          const value = !usePlayerControls.getState().isMuted;
          audio.muted = value;
          usePlayerControls.setState({ isMuted: value });
          set({ isMuted: value });
        },
        setVolume: (volume: number) => {
          const v = Math.max(0, Math.min(1, volume));
          audio.volume = v;
          usePlayerControls.setState({ volume: Math.round(v * 100) });
          set({ volume: v });
        },
        setRate: (rate: number) => {
          audio.playbackRate = rate;
          usePlayerControls.setState({ rate });
          set({ rate });
        },
        setPlayMode: playMode => {
          usePlayerControls.setState({ playMode });
          set({ playMode });
          if (playMode === PlayMode.Single) {
            audio.loop = true;
          } else {
            audio.loop = false;
          }
        },
        seek: (time: number) => {
          audio.currentTime = time;
          usePlayerControls.setState({ currentTime: Math.round(time * 1000) });
        },
        setDuration: (duration: number) => {
          usePlayerControls.setState({ duration: Math.round(duration * 1000) });
          set({ duration });
        },
        reset: () => {
          audio.src = "";
          usePlayerControls.setState({ isPlaying: false, duration: 0, currentTime: 0 });
          set({ isPlaying: false, duration: 0, currentTime: 0 });
        },
      };
    },
    {
      name: "playing-queue",
      partialize: state => ({
        current: state.current,
        list: state.list,
        expiredTime: state.expiredTime,
      }),
      onRehydrateStorage: () => {
        return async state => {
          const { current, expiredTime } = state || initState;
          if (current?.url) {
            audio.src = current.url;
          }

          // 刷新播放链接
          if (current?.url && moment.unix(expiredTime ?? 0).isSameOrBefore(moment())) {
            const cid = current.pages?.find(item => item.pageIndex === (current?.currentPage ?? 1))?.pageCid;
            if (cid) {
              const { audioUrl, expiredTime, isLossless } = await getMVUrl(current.bvid, cid);
              usePlayingQueue.setState(s => ({
                ...s,
                current: { ...(s.current as PlayingMV), url: audioUrl, expiredTime, isLossless },
              }));
              audio.src = audioUrl;
            } else {
              usePlayingQueue.setState(s => ({
                ...s,
                current: null,
              }));
            }
          }
        };
      },
    },
  ),
);
