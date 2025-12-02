import { addToast } from "@heroui/react";
import moment from "moment";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";

import { PlayMode } from "@/common/constants/audio";
import { getMVUrl } from "@/common/utils/audio";
import { formatUrlProtocal, getUrlParams } from "@/common/utils/url";
import { getWebInterfaceView } from "@/service/web-interface-view";

import { broadcastState, isMiniPlayer, onMessage, requestSync, sendCommand } from "./mini-player-sync";
import { useSettings } from "./settings";

interface PlayMVList {
  bvid: string;
  title: string;
  cover: string;
  ownerName: string;
  ownerMid: number;
}

interface MVPageData {
  cid: string;
  title: string;
  duration: number;
  cover: string;
  audioUrl?: string;
  videoUrl?: string;
  isLossless?: boolean; // 是否为无损音频
}

interface MVData extends PlayMVList {
  aid?: string;
  cid?: string;
  pages?: MVPageData[];
}

interface State {
  // 播放/暂停
  isPlaying: boolean;
  // 静音
  isMuted: boolean;
  // 音量 0-1
  volume: number;
  // 播放模式
  playMode: PlayMode;
  // 播放速率（0.5x - 2.0x）
  rate: number;
  // 当前时间（秒）
  currentTime: number | undefined;
  // 总时长（秒）
  duration: number | undefined;

  list: MVData[];
  currentBvid?: string;
  currentCid?: string;
  prevBvid?: string;
  prevCid?: string;
  nextBvid?: string;
}

interface Action {
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void; // 0-1
  setPlayMode: (mode: PlayMode) => void;
  setRate: (rate: number) => void; // 0.5-2.0
  seek: (s: number) => void;

  init: VoidFunction;
  play: (bvid: string) => Promise<void>;
  playPage: (cid: string) => Promise<void>;
  playList: (mvs: PlayMVList[]) => Promise<void>;
  addToNext: (bvid: string) => void;
  addList: (mvs: PlayMVList[]) => void;
  delMV: (bvid: string) => void;
  delPage: (cid: string) => void;
  clear: () => void;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  getAudio: () => HTMLAudioElement | null;
}

const getMVData = async (bvid: string) => {
  const res = await getWebInterfaceView({ bvid });

  return {
    aid: String(res?.data?.aid),
    bvid,
    cid: String(res?.data?.cid),
    title: res?.data?.title,
    cover: res?.data?.pic,
    ownerName: res?.data?.owner?.name,
    ownerMid: res?.data?.owner?.mid,
    pages: res?.data?.pages?.map(item => ({
      cid: String(item.cid),
      title: res?.data?.pages?.length > 1 ? item.part : res?.data?.title,
      duration: item.duration,
      cover: formatUrlProtocal(item.first_frame || res?.data?.pic),
    })),
  };
};

const isUrlValid = (url?: string): url is string => {
  return Boolean(url) && moment().isBefore(moment.unix(Number(getUrlParams(url as string).deadline)));
};

const toastError = (error: unknown) => {
  addToast({
    title: error instanceof Error ? error.message : "获取播放链接失败",
    color: "danger",
  });
};

const handlePlayError = (error: any) => {
  const errorMsg = error?.message || error?.name || "";
  if (!errorMsg.includes("interrupted") && !errorMsg.includes("NotAllowed")) {
    toastError(error);
  }
};

const updateMediaSession = ({ title, artist, cover }: { title: string; artist: string; cover: string }) => {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      artwork: [{ src: cover }],
    });
  }
};

const createAudio = (): HTMLAudioElement | null => {
  if (isMiniPlayer) return null;
  const audio = new Audio();
  audio.preload = "metadata";
  audio.controls = false;
  audio.crossOrigin = "anonymous";
  return audio;
};

const audio = createAudio();

const updatePlaybackState = () => {
  if (!audio) return;
  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = audio.paused ? "paused" : "playing";
  }
  try {
    if (window.electron && window.electron.updatePlaybackState) {
      window.electron.updatePlaybackState(!audio.paused);
    }
  } catch (err) {
    // 渲染端上报失败不影响本地状态；仅记录日志便于定位
    console.warn("[renderer] updatePlaybackState IPC failed:", err);
  }
};

const updatePositionState = () => {
  if (!audio) return;
  if ("mediaSession" in navigator) {
    const dur = audio.duration;
    if (!Number.isNaN(dur) && dur !== Infinity) {
      navigator.mediaSession.setPositionState({
        duration: dur,
        playbackRate: audio.playbackRate,
        position: audio.currentTime,
      });
    }
  }
};

const setupMiniPlayerListener = (set: (fn: (state: State) => void) => void) => {
  onMessage(event => {
    const { type, payload } = event.data;
    if (type === "state-sync") {
      set(state => {
        Object.assign(state, payload);
      });
    }
  });
  requestSync();
};

const setupMainWindowListener = (get: () => State & Action) => {
  onMessage(event => {
    const { type, command, payload } = event.data;
    if (type === "command") {
      switch (command) {
        case "togglePlay":
          get().togglePlay();
          break;
        case "prev":
          get().prev();
          break;
        case "next":
          get().next();
          break;
        case "seek":
          get().seek(payload);
          break;
        case "setPlayMode":
          get().setPlayMode(payload);
          break;
      }
    } else if (type === "request-sync") {
      const state = get();
      broadcastState({
        isPlaying: state.isPlaying,
        isMuted: state.isMuted,
        volume: state.volume,
        playMode: state.playMode,
        rate: state.rate,
        currentTime: state.currentTime,
        duration: state.duration,
        list: state.list,
        currentBvid: state.currentBvid,
        currentCid: state.currentCid,
      });
    }
  });
};

export const usePlayQueue = create<State & Action>()(
  persist(
    immer((set, get) => {
      const loadAndPlayCurrent = async (autoPlay: boolean = true) => {
        if (!audio) return;
        const { currentBvid, currentCid, list } = get();
        if (!currentBvid || !currentCid) return;

        const mvData = list?.find(item => item.bvid === currentBvid);
        const pageData = mvData?.pages?.find(page => page.cid === currentCid);
        let audioUrl = pageData?.audioUrl;

        if (!isUrlValid(pageData?.audioUrl)) {
          try {
            const audioQuality = useSettings.getState().audioQuality;
            const playData = await getMVUrl(currentBvid, currentCid, audioQuality);
            audioUrl = playData.audioUrl;
            set(state => {
              const pd = state.list?.find(item => item.bvid === currentBvid)?.pages?.find(p => p.cid === currentCid);
              if (pd) Object.assign(pd, playData);
            });
          } catch (error) {
            toastError(error);
            return;
          }
        }

        if (audioUrl) {
          if (audio.src !== audioUrl) {
            audio.src = audioUrl;
          }

          const { duration, currentTime } = get();
          if (duration && currentTime) {
            audio.currentTime = currentTime;
          }

          if (autoPlay) {
            try {
              await audio.play();
            } catch (error: any) {
              handlePlayError(error);
            }
          }

          updateMediaSession({
            title: pageData?.title || "",
            artist: mvData?.ownerName || "",
            cover: mvData?.cover || "",
          });
        }
      };

      const resetProgress = () => {
        if (audio) {
          audio.pause();
          set({ currentTime: undefined, duration: undefined });
        }
      };

      return {
        isPlaying: false,
        isMuted: false,
        volume: 0.5,
        playMode: PlayMode.Loop,
        rate: 1,
        currentTime: undefined,
        duration: undefined,
        list: [],
        init: async () => {
          if (isMiniPlayer) {
            setupMiniPlayerListener(set);
            return;
          }

          setupMainWindowListener(get);

          if (audio) {
            audio.volume = get().volume;
            audio.muted = get().isMuted;
            audio.playbackRate = get().rate;
            audio.loop = get().playMode === PlayMode.Single;

            audio.ondurationchange = () => {
              const dur = audio.duration;
              if (!Number.isNaN(dur) && dur !== Infinity) {
                const duration = Math.round(dur * 100) / 100;
                set({ duration });
                broadcastState({ duration });
                updatePositionState();
              }
            };

            audio.ontimeupdate = () => {
              const currentTime = Math.round(audio.currentTime * 100) / 100;
              set({ currentTime });
              broadcastState({ currentTime });
            };

            audio.onseeked = () => {
              updatePositionState();
            };

            audio.onratechange = () => {
              updatePositionState();
            };

            audio.onplay = () => {
              set({ isPlaying: true });
              broadcastState({ isPlaying: true });
              updatePlaybackState();
              updatePositionState();
            };

            audio.onpause = () => {
              set({ isPlaying: false });
              broadcastState({ isPlaying: false });
              updatePlaybackState();
              updatePositionState();
            };

            audio.onended = () => {
              if (get().playMode === PlayMode.Single) {
                return;
              }

              const currentIndex = get().list.findIndex(item => item.bvid === get().currentBvid);
              if (get().playMode === PlayMode.Sequence && currentIndex === get().list.length - 1) {
                audio.currentTime = 0;
                return;
              }

              get().next();
            };

            audio.onerror = error => {
              console.error("音频播放发生错误", error);
            };

            if ("mediaSession" in navigator) {
              navigator.mediaSession.setActionHandler("play", () => get().togglePlay());
              navigator.mediaSession.setActionHandler("pause", () => get().togglePlay());
              navigator.mediaSession.setActionHandler("previoustrack", () => get().prev());
              navigator.mediaSession.setActionHandler("nexttrack", () => get().next());
              navigator.mediaSession.setActionHandler("seekto", details => {
                if (details.seekTime) get().seek(Math.round(details.seekTime * 100) / 100);
                updatePositionState();
              });
              navigator.mediaSession.setActionHandler("seekbackward", details => {
                const offset = details?.seekOffset || 10;
                get().seek(Math.round((audio.currentTime - offset) * 100) / 100);
              });
              navigator.mediaSession.setActionHandler("seekforward", details => {
                const offset = details?.seekOffset || 10;
                const next = Math.round((audio.currentTime + offset) * 100) / 100;
                get().seek(next);
              });
            }

            const { currentBvid, currentCid } = get();

            if (currentBvid && currentCid) {
              await loadAndPlayCurrent(false);
            }
          }
        },
        togglePlay: async () => {
          if (isMiniPlayer) {
            sendCommand("togglePlay");
            return;
          }
          if (audio?.src) {
            if (audio.paused) {
              if (isUrlValid(audio.src)) {
                audio.play().catch(handlePlayError);
              } else {
                const playData = await getMVUrl(get().currentBvid as string, get().currentCid as string);
                set(state => {
                  const pd = state.list
                    ?.find(item => item.bvid === get().currentBvid)
                    ?.pages?.find(p => p.cid === get().currentCid);
                  if (pd && playData.audioUrl) {
                    audio.src = pd.audioUrl as string;
                    if (get().currentTime) {
                      audio.currentTime = get().currentTime as number;
                    }

                    Object.assign(pd, playData);
                  }
                });
              }
            } else {
              audio.pause();
            }
          }
        },
        toggleMute: () => {
          if (audio) {
            audio.muted = !audio.muted;
          }
          set(s => ({ isMuted: !s.isMuted }));
        },
        setVolume: volume => {
          if (audio) {
            audio.volume = volume;
          }
          set({ volume });
        },
        setPlayMode: mode => {
          if (isMiniPlayer) {
            sendCommand("setPlayMode", mode);
            return;
          }
          if (audio) {
            audio.loop = mode === PlayMode.Single;
          }
          set({ playMode: mode });
          broadcastState({ playMode: mode });
        },
        setRate: rate => {
          if (audio) {
            audio.playbackRate = rate;
          }
          set({ rate });
        },
        seek: s => {
          if (isMiniPlayer) {
            sendCommand("seek", s);
            return;
          }
          if (audio) {
            audio.currentTime = s;
          }
          set({ currentTime: s });
        },
        play: async bvid => {
          const { currentBvid, list } = get();

          if (currentBvid === bvid) {
            if (!get().isPlaying && audio) {
              audio.play();
            }
            return;
          }

          resetProgress();
          set({ currentBvid: bvid });

          const isMVInQueue = list?.some(item => item.bvid === bvid);
          if (isMVInQueue) {
            const oldMVData = list?.find(item => item.bvid === bvid);
            const cid = oldMVData?.cid || oldMVData?.pages?.[0]?.cid;
            if (cid) {
              set({ currentCid: cid });
            } else {
              try {
                const newMVData = await getMVData(bvid);
                set(state => {
                  state.currentCid = newMVData.cid;
                  const inQueueMVData = state.list?.find(item => item.bvid === bvid);
                  if (inQueueMVData) {
                    Object.assign(inQueueMVData, newMVData);
                  }
                });
              } catch (error) {
                toastError(error);
                return;
              }
            }
            await loadAndPlayCurrent();
          } else {
            try {
              const newMVData = await getMVData(bvid);
              set(state => {
                state.currentCid = newMVData.cid;
                state.list.unshift(newMVData);
              });
              await loadAndPlayCurrent();
            } catch (error) {
              toastError(error);
            }
          }
        },
        playList: async mvs => {
          resetProgress();
          const firstMV = mvs[0];
          set({
            currentBvid: firstMV.bvid,
            list: mvs,
          });
          const mvData = await getMVData(firstMV.bvid);
          set(state => {
            state.currentCid = mvData.cid;
            const inQueue = state.list?.find(item => item.bvid === firstMV.bvid);
            if (inQueue) {
              inQueue.pages = mvData.pages;
            }
          });
          await loadAndPlayCurrent();
        },
        playPage: async (cid: string) => {
          resetProgress();
          const { currentBvid, list } = get();
          const mvData = list?.find(item => item.bvid === currentBvid);
          const pageData = mvData?.pages?.find(item => item.cid === cid);
          if (pageData) {
            set(state => {
              state.currentCid = cid;
            });
            await loadAndPlayCurrent();
          }
        },
        next: async () => {
          if (isMiniPlayer) {
            sendCommand("next");
            return;
          }
          if (!get().list.length) {
            return;
          }

          resetProgress();

          if (get().list.length === 1) {
            await loadAndPlayCurrent();
            return;
          }

          const { playMode, nextBvid, list, currentBvid, currentCid } = get();
          const currentIndex = list.findIndex(item => item.bvid === currentBvid);

          if (!list.length || currentIndex === -1) {
            return;
          }

          if (nextBvid) {
            const nextMVData = list.find(item => item.bvid === nextBvid);
            if (nextMVData) {
              await get().play(nextMVData.bvid);
              set({ nextBvid: undefined });
              return;
            }
          }

          const currentMVData = list[currentIndex];
          const currentPageIndex = currentMVData?.pages?.findIndex(item => item.cid === currentCid) || 0;
          const pages = currentMVData?.pages || [];

          if (pages.length > 1 && currentPageIndex < pages.length - 1) {
            const nextPage = pages[currentPageIndex + 1];
            await get().playPage(nextPage.cid);
          } else {
            const nextIndex = (currentIndex + 1) % list.length;
            switch (playMode) {
              case PlayMode.Loop: {
                const nextMVData = list[nextIndex];
                console.log("nextMVData", nextMVData);
                await get().play(nextMVData.bvid);
                break;
              }
              case PlayMode.Sequence: {
                if (nextIndex === 0) {
                  return;
                }
                const nextMVData = list[nextIndex];
                await get().play(nextMVData.bvid);
                break;
              }
              case PlayMode.Random: {
                let randomIndex: number;
                do {
                  randomIndex = Math.floor(Math.random() * list.length);
                } while (randomIndex === currentIndex);
                const nextMVData = list[randomIndex];
                await get().play(nextMVData.bvid);
                set({ prevBvid: currentBvid, prevCid: currentCid });
                break;
              }
              case PlayMode.Single: {
                const nextMVData = list[nextIndex];
                await get().play(nextMVData.bvid);
                break;
              }
            }
          }
        },
        prev: async () => {
          if (isMiniPlayer) {
            sendCommand("prev");
            return;
          }
          if (get().list.length <= 1) {
            return;
          }

          resetProgress();

          const { list, prevBvid, prevCid } = get();
          const prevMVData = list.find(item => item.bvid === prevBvid);
          if (prevMVData) {
            const prevPageData = prevMVData?.pages?.find(item => item.cid === prevCid);
            if (prevPageData) {
              set({ currentBvid: prevBvid, currentCid: prevCid, prevBvid: undefined, prevCid: undefined });
              await loadAndPlayCurrent();
            }
          } else {
            const currentIndex = list.findIndex(item => item.bvid === get().currentBvid);
            const currentMVData = list[currentIndex];
            const currentPageIndex = currentMVData?.pages?.findIndex(item => item.cid === get().currentCid) ?? -1;
            if (currentPageIndex > 0) {
              const prevPage = currentMVData?.pages?.[currentPageIndex - 1];
              set({ currentBvid: currentMVData.bvid, currentCid: prevPage?.cid });
            } else {
              const prevIndex = (currentIndex - 1 + list.length) % list.length;
              if (currentIndex !== -1) {
                set({ currentBvid: list[prevIndex].bvid, currentCid: list[prevIndex].cid });
              }
            }

            await loadAndPlayCurrent();
          }
        },
        addToNext: async bvid => {
          if (bvid === get().currentBvid) {
            return;
          }
          const { list } = get();
          const index = list.findIndex(item => item.bvid === bvid);
          const currentIndex = list.findIndex(item => item.bvid === get().currentBvid);
          if (index === currentIndex + 1) {
            return;
          }

          if (!list.length) {
            get().play(bvid);
            return;
          }

          if (index !== -1) {
            set(state => {
              const [mvData] = state.list.splice(index, 1);
              state.list.splice(index < currentIndex ? currentIndex : currentIndex + 1, 0, mvData);
              state.nextBvid = mvData.bvid;
            });
          } else {
            const mvData = await getMVData(bvid);
            set(state => {
              const currentIndex = state.list.findIndex(item => item.bvid === state.currentBvid);
              if (currentIndex !== -1) {
                state.list.splice(currentIndex + 1, 0, mvData);
              }
              state.nextBvid = mvData.bvid;
            });
          }
        },
        addList: async mvs => {
          const [first, ...rest] = mvs;
          const { currentBvid } = get();

          if (first.bvid === currentBvid) {
            set({ list: [...mvs] });
          } else {
            try {
              const mvData = await getMVData(first.bvid);
              const audioQuality = useSettings.getState().audioQuality;
              const playData = await getMVUrl(first.bvid, mvData.cid, audioQuality);
              mvData.pages = mvData.pages?.map(page =>
                page.cid === mvData.cid
                  ? {
                      ...page,
                      audioUrl: playData.audioUrl,
                      videoUrl: playData.videoUrl,
                      isLossless: playData.isLossless,
                    }
                  : page,
              );
              set({
                currentBvid: first.bvid,
                currentCid: mvData.cid,
                list: [mvData, ...rest],
              });
            } catch (error) {
              toastError(error);
            }
          }
        },
        delMV: bvid => {
          if (get().list.length === 1) {
            get().clear();
            return;
          }

          if (bvid === get().currentBvid) {
            get().next();
          }

          set(state => {
            const removeIndex = state.list.findIndex(item => item.bvid === bvid);
            if (removeIndex !== -1) {
              state.list.splice(removeIndex, 1);
            }
          });
        },
        delPage: cid => {
          set(state => {
            const pages = state.list.find(item => item.bvid === get().currentBvid)?.pages || [];
            const removePageIndex = pages.findIndex(item => item.cid === cid);
            if (removePageIndex !== -1) {
              pages.splice(removePageIndex, 1);
            }
          });
        },
        clear: () => {
          if (audio) {
            audio.pause();
            audio.src = "";
          }
          updatePlaybackState();
          updatePositionState();
          set({
            isPlaying: false,
            currentTime: undefined,
            duration: undefined,
            list: [],
            currentBvid: undefined,
            currentCid: undefined,
            prevBvid: undefined,
            prevCid: undefined,
            nextBvid: undefined,
          });
        },
        getAudio: () => audio,
      };
    }),
    {
      name: "playing-queue",
      partialize: state => ({
        isMuted: state.isMuted,
        volume: state.volume,
        playMode: state.playMode,
        rate: state.rate,
        currentTime: state.currentTime,
        duration: state.duration,
        currentBvid: state.currentBvid,
        currentCid: state.currentCid,
        prevBvid: state.prevBvid,
        prevCid: state.prevCid,
        list: state.list,
      }),
    },
  ),
);

if (!isMiniPlayer) {
  let prevState: { currentBvid?: string; currentCid?: string; list: MVData[] } | null = null;
  usePlayQueue.subscribe(state => {
    const selectedState = {
      currentBvid: state.currentBvid,
      currentCid: state.currentCid,
      list: state.list,
    };
    if (!prevState || !shallow(prevState, selectedState)) {
      broadcastState(selectedState);
      prevState = selectedState;
    }
  });
}
