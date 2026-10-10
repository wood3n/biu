import { shallow } from "zustand/shallow";

import type { PlayMode } from "@/common/constants/audio";

import { useLyricsSearchStore } from "@/store/lyrics-search";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";

export const DESKTOP_LYRICS_CHANNEL = "desktop-lyrics-sync-channel";

export type DesktopLyricsCommandType = "init" | "next" | "openLyricsSearch" | "prev" | "seek" | "togglePlay";

/** 主窗口推送给桌面歌词窗口的播放状态 */
export interface DesktopLyricsSnapshot {
  /** 视频 aid */
  aid?: string;
  /** UP 主名称 */
  artist?: string;
  /** 视频 bvid */
  bvid?: string;
  /** 分集 cid */
  cid?: string;
  /** 封面 */
  cover?: string;
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 总时长（秒） */
  duration: number;
  /** 是否有正在播放的曲目 */
  hasTrack: boolean;
  isPlaying: boolean;
  /** 分集序号 */
  pageIndex?: number;
  playMode?: PlayMode;
  title?: string;
  /** 总分集数 */
  totalPage?: number;
}

export interface DesktopLyricsMessageFromLyrics {
  data?: {
    state?: { currentTime?: number };
    type: DesktopLyricsCommandType;
  };
  from: "lyrics";
  ts: number;
}

export interface DesktopLyricsMessageFromMain {
  /** 事件类型：state = 播放状态同步，lyricsUpdated = 主界面歌词已更新 */
  event?: "lyricsUpdated" | "state";
  from: "main";
  state?: DesktopLyricsSnapshot;
  ts: number;
}

interface BroadcastHandle {
  channel: BroadcastChannel;
  unsubscribePlayList: VoidFunction;
  unsubscribePlayProgress: VoidFunction;
}

let handle: BroadcastHandle | null = null;

export function createDesktopLyricsChannel() {
  return new BroadcastChannel(DESKTOP_LYRICS_CHANNEL);
}

/** 当前渲染进程是否为主窗口（迷你播放器 / 桌面歌词窗口都不算） */
export function isMainWindow() {
  const hash = window.location.hash;
  return !hash.includes("mini-player") && !hash.includes("desktop-lyrics");
}

export function getDesktopLyricsSnapshot(): DesktopLyricsSnapshot {
  const { duration, getPlayItem, isPlaying, list, playMode } = usePlayList.getState();
  const currentTime = usePlayProgress.getState().currentTime;
  const playItem = getPlayItem();

  return {
    aid: playItem?.aid,
    artist: playItem?.ownerName,
    bvid: playItem?.bvid,
    cid: playItem?.cid,
    cover: playItem?.pageCover || playItem?.cover,
    currentTime: Number(currentTime ?? 0),
    duration: Number(duration ?? 0),
    hasTrack: Boolean(playItem) && list.length > 0,
    isPlaying,
    pageIndex: playItem?.pageIndex,
    playMode,
    title: playItem?.pageTitle || playItem?.title,
    totalPage: playItem?.totalPage,
  };
}

function postSnapshot(channel: BroadcastChannel) {
  const message: DesktopLyricsMessageFromMain = {
    event: "state",
    from: "main",
    state: getDesktopLyricsSnapshot(),
    ts: Date.now(),
  };

  channel.postMessage(message);
}

/**
 * 通知桌面歌词窗口重新读取歌词缓存（主界面手动匹配歌词后调用）
 */
export function notifyLyricsUpdated() {
  if (!handle) return;

  const message: DesktopLyricsMessageFromMain = {
    event: "lyricsUpdated",
    from: "main",
    ts: Date.now(),
  };

  handle.channel.postMessage(message);
}

function handleCommand(message: DesktopLyricsMessageFromLyrics, channel: BroadcastChannel) {
  const data = message.data;
  if (!data) return;

  switch (data.type) {
    case "init": {
      postSnapshot(channel);
      break;
    }
    case "seek": {
      const time = data.state?.currentTime;
      if (typeof time === "number" && Number.isFinite(time)) {
        usePlayList.getState().seek(time);
      }
      break;
    }
    case "next": {
      void usePlayList.getState().next();
      break;
    }
    case "prev": {
      void usePlayList.getState().prev();
      break;
    }
    case "togglePlay": {
      usePlayList.getState().togglePlay();
      break;
    }
    case "openLyricsSearch": {
      // 桌面歌词窗口空间太小，唤起主界面的「搜索歌词」弹窗来手动选歌词
      void window.electron.focusMainWindow();
      useLyricsSearchStore.getState().setOpen(true);
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * 主窗口开始向桌面歌词窗口广播播放状态。
 * 重复调用不会产生多个通道。
 */
export function startDesktopLyricsBroadcast() {
  if (handle) return;

  const channel = createDesktopLyricsChannel();

  channel.onmessage = event => {
    const message = event.data as DesktopLyricsMessageFromLyrics;
    if (message?.from !== "lyrics") return;
    handleCommand(message, channel);
  };

  const unsubscribePlayList = usePlayList.subscribe((state, prevState) => {
    if (
      !shallow(
        {
          playId: state.playId,
          isPlaying: state.isPlaying,
          playMode: state.playMode,
          duration: state.duration,
        },
        {
          playId: prevState.playId,
          isPlaying: prevState.isPlaying,
          playMode: prevState.playMode,
          duration: prevState.duration,
        },
      )
    ) {
      postSnapshot(channel);
    }
  });

  const unsubscribePlayProgress = usePlayProgress.subscribe((state, prevState) => {
    if (state.currentTime !== prevState.currentTime) {
      postSnapshot(channel);
    }
  });

  handle = { channel, unsubscribePlayList, unsubscribePlayProgress };

  // 立即推送一次，避免歌词窗口已经挂载但主窗口刚开始广播
  postSnapshot(channel);
}

export function stopDesktopLyricsBroadcast() {
  if (!handle) return;

  handle.unsubscribePlayList();
  handle.unsubscribePlayProgress();
  handle.channel.close();
  handle = null;
}

/** 切换桌面歌词窗口显示状态，返回切换后的状态 */
export function toggleDesktopLyricsWindow() {
  return window.electron.toggleDesktopLyrics();
}
