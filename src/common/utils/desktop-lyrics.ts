import type { PlayData } from "@/store/play-list";

import { getActiveLyricIndex, useLyricsStore } from "@/store/lyrics";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";
import { useSettings } from "@/store/settings";

/** 判断当前渲染进程是否是子窗口（迷你播放器/桌面歌词） */
function isSubWindow() {
  const hash = window.location.hash;
  return hash.includes("mini-player") || hash.includes("desktop-lyrics");
}

const getTranslationByTime = (time?: number) => {
  if (typeof time !== "number") return undefined;

  const { translatedLyrics } = useLyricsStore.getState();
  return translatedLyrics.find(item => item.time === time)?.text;
};

const findPlayItem = (playId?: string): PlayData | undefined => {
  const { list } = usePlayList.getState();
  return list.find(item => item.id === playId);
};

/**
 * 计算桌面歌词窗口需要展示的内容快照
 *
 * 以主窗口的播放/歌词状态为准，通过 IPC 交给主进程再转发给桌面歌词窗口，
 * 这样主窗口缩到托盘/最小化时桌面歌词仍然可以正常更新。
 */
function computeDesktopLyricsPayload(): DesktopLyricsPayload {
  const settings = useSettings.getState();
  const { playId, isPlaying } = usePlayList.getState();
  const playItem = findPlayItem(playId);
  const { lyrics } = useLyricsStore.getState();
  const currentTime = usePlayProgress.getState().currentTime;

  const activeIndex = getActiveLyricIndex(lyrics, currentTime * 1000);
  // 还没唱到第一句时展示第一句（与顶部歌词栏保持一致）
  const index = activeIndex >= 0 ? activeIndex : lyrics.length ? 0 : -1;
  const line = index >= 0 ? lyrics[index] : undefined;

  return {
    enabled: Boolean(settings.showDesktopLyrics),
    locked: Boolean(settings.desktopLyricsLocked),
    active: Boolean(playItem) && Boolean(line),
    text: line?.text,
    translation: getTranslationByTime(line?.time),
    isPlaying: Boolean(isPlaying),
    playId,
    index,
    fontSize: Number(settings.desktopLyricsFontSize) || 32,
  };
}

let isSyncStarted = false;
let lastSerialized = "";

function syncPayload() {
  if (!window.electron?.syncDesktopLyrics) return;

  const payload = computeDesktopLyricsPayload();
  const serialized = JSON.stringify(payload);
  if (serialized === lastSerialized) return;

  lastSerialized = serialized;
  window.electron.syncDesktopLyrics(payload);
}

/**
 * 启动主窗口 -> 桌面歌词窗口的状态同步。
 *
 * - 只在主窗口调用，子窗口调用会直接返回
 * - 订阅播放状态、歌词、进度与设置变化，变化时向主进程同步一次
 * - 同时接收托盘/桌面歌词窗口发来的开关请求（主窗口是设置的数据源）
 */
export function startDesktopLyricsSync() {
  if (isSyncStarted || isSubWindow()) {
    return () => {};
  }

  isSyncStarted = true;
  syncPayload();

  const unsubscribers = [
    usePlayList.subscribe((state, prevState) => {
      if (state.playId !== prevState.playId || state.isPlaying !== prevState.isPlaying) {
        syncPayload();
      }
    }),
    usePlayProgress.subscribe((state, prevState) => {
      if (state.currentTime !== prevState.currentTime) {
        syncPayload();
      }
    }),
    useLyricsStore.subscribe((state, prevState) => {
      if (
        state.lyrics !== prevState.lyrics ||
        state.translatedLyrics !== prevState.translatedLyrics ||
        state.isLoaded !== prevState.isLoaded
      ) {
        syncPayload();
      }
    }),
    useSettings.subscribe((state, prevState) => {
      if (
        state.showDesktopLyrics !== prevState.showDesktopLyrics ||
        state.desktopLyricsLocked !== prevState.desktopLyricsLocked ||
        state.desktopLyricsFontSize !== prevState.desktopLyricsFontSize
      ) {
        syncPayload();
      }
    }),
  ];

  const offToggleRequested = window.electron.onDesktopLyricsToggleRequested(() => {
    const { showDesktopLyrics, update } = useSettings.getState();
    update({ showDesktopLyrics: !showDesktopLyrics });
  });

  const offLockToggleRequested = window.electron.onDesktopLyricsLockToggleRequested(() => {
    const { desktopLyricsLocked, update } = useSettings.getState();
    update({ desktopLyricsLocked: !desktopLyricsLocked });
  });

  return () => {
    isSyncStarted = false;
    lastSerialized = "";
    unsubscribers.forEach(unsubscribe => unsubscribe());
    offToggleRequested?.();
    offLockToggleRequested?.();
  };
}
