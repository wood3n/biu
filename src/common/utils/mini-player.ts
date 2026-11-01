import { addToast } from "@heroui/react";
import { shallow } from "zustand/shallow";

import type { PlayMode } from "@/common/constants/audio";

import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";
import { useSettings } from "@/store/settings";

export type MiniPlayerCommandFromMini = "init" | "togglePlayMode" | "next" | "prev" | "togglePlay";

export interface MiniPlayerMainStateSnapshot {
  isSingle: boolean;
  isPlaying: boolean;
  title?: string;
  cover?: string;
  ownerName?: string;
  bvid?: string;
  cid?: string;
  currentTime: number;
  duration: number;
  playMode?: PlayMode;
  playId?: string;
}

export interface MiniPlayerMessageFromMini {
  from: "mini";
  data?: {
    type: MiniPlayerCommandFromMini;
    state?: any;
  };
  ts?: number;
}

/** 悬浮窗渲染需要的设置（主窗口是唯一写入方，小窗只读 + 收推送） */
export interface MiniPlayerViewSettings {
  backdrop: MiniPlayerBackdrop;
  marquee: boolean;
}

export interface MiniPlayerMessageFromMain {
  from: "main";
  type?: "state" | "settings";
  state?: MiniPlayerMainStateSnapshot;
  settings?: MiniPlayerViewSettings;
  ts: number;
}

export interface MiniPlayerMainSyncState {
  isBroadcasting: boolean;
}

/** 悬浮窗底板：数组顺序即设置页 Tab 顺序；模式只由主窗口设置页决定，小窗跟随 */
export const MINI_PLAYER_BACKDROPS: { value: MiniPlayerBackdrop; label: string }[] = [
  { value: "acrylic", label: "系统亚克力" },
  { value: "light", label: "纯色浅" },
  { value: "dark", label: "纯色深" },
];

/**
 * 兼容旧值：底板一度是「自己抓桌面做假模糊」的 blur，
 * 现在模糊由 DWM 材质承担，持久化的 blur 一律按 acrylic 处理，否则查不到对应样式。
 */
export function normalizeMiniPlayerBackdrop(value: unknown): MiniPlayerBackdrop {
  if (value === "blur") return "acrylic";
  return MINI_PLAYER_BACKDROPS.some(item => item.value === value) ? (value as MiniPlayerBackdrop) : "acrylic";
}

let bc: BroadcastChannel | null = null;
let unsubscribePlayList: VoidFunction | null = null;
let unsubscribePlayProgress: VoidFunction | null = null;
let unsubscribeSettings: VoidFunction | null = null;
let isBroadcasting = false;

export function createBroadcastChannel() {
  return new BroadcastChannel("play-list-store-sync-channel");
}

export function getMainStateSnapshot(): MiniPlayerMainStateSnapshot {
  const { list, isPlaying, playMode, duration, playId, getPlayItem } = usePlayList.getState();
  const currentTime = usePlayProgress.getState().currentTime;
  const playItem = getPlayItem();

  return {
    isSingle: list.length === 1,
    title: playItem?.pageTitle || playItem?.title,
    cover: playItem?.pageCover || playItem?.cover,
    ownerName: playItem?.ownerName,
    bvid: playItem?.bvid,
    cid: playItem?.cid,
    playId,
    isPlaying,
    currentTime: Number(currentTime ?? 0),
    playMode,
    duration: Number(duration ?? 0),
  };
}

function postMainState(channel: BroadcastChannel) {
  const message: MiniPlayerMessageFromMain = {
    from: "main",
    type: "state",
    state: getMainStateSnapshot(),
    ts: Date.now(),
  };
  channel.postMessage(message);
}

function pickMiniPlayerView(state: AppSettings): MiniPlayerViewSettings {
  return { backdrop: normalizeMiniPlayerBackdrop(state.miniPlayerBackdrop), marquee: state.marqueeEnabled };
}

function postViewSettings(channel: BroadcastChannel) {
  const message: MiniPlayerMessageFromMain = {
    from: "main",
    type: "settings",
    settings: pickMiniPlayerView(useSettings.getState()),
    ts: Date.now(),
  };
  channel.postMessage(message);
}

function handleMessageFromMini(message: MiniPlayerMessageFromMini, channel: BroadcastChannel) {
  const data = message.data;
  if (!data) return;

  const type = data.type;
  switch (type) {
    case "init": {
      postMainState(channel);
      postViewSettings(channel);
      break;
    }
    case "togglePlayMode": {
      usePlayList.getState().togglePlayMode();
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
    default: {
      break;
    }
  }
}

/**
 * 启动主窗口 -> mini 播放器的状态同步通道。
 *
 * - 只会启动一次；重复调用会直接返回。
 * - 收到 mini 端的 `init/next/prev/togglePlay/togglePlayMode` 会转发到主播放状态。
 * - 主播放状态发生变化会推送给 mini 端更新 UI。
 */
function startMiniPlayerMainSync() {
  if (isBroadcasting) return;

  bc = createBroadcastChannel();

  isBroadcasting = true;

  bc.onmessage = ev => {
    const data = ev.data as MiniPlayerMessageFromMini;
    if (data?.from !== "mini") return;
    handleMessageFromMini(data, bc as BroadcastChannel);
  };

  unsubscribePlayList = usePlayList.subscribe((state, prevState) => {
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
      postMainState(bc as BroadcastChannel);
    }
  });

  unsubscribePlayProgress = usePlayProgress.subscribe((state, prevState) => {
    if (state.currentTime !== prevState.currentTime) {
      postMainState(bc as BroadcastChannel);
    }
  });

  // 小窗自己写设置会把主窗口的内存副本刷旧，设置只由主窗口下发
  unsubscribeSettings = useSettings.subscribe((state, prevState) => {
    if (!shallow(pickMiniPlayerView(state), pickMiniPlayerView(prevState))) {
      postViewSettings(bc as BroadcastChannel);
    }
  });

  postViewSettings(bc);
}

/**
 * 停止主窗口 -> mini 播放器的状态同步通道。
 */
function stopMiniPlayerMainSync() {
  if (!isBroadcasting) return;

  unsubscribePlayList?.();
  unsubscribePlayList = null;
  unsubscribePlayProgress?.();
  unsubscribePlayProgress = null;
  unsubscribeSettings?.();
  unsubscribeSettings = null;
  bc?.close();
  bc = null;
  isBroadcasting = false;
}

/**
 * 主窗口调整歌词偏移后，实时同步给 mini 播放器（小窗歌词需应用同一偏移）。
 * 临时创建通道发送后立即关闭；无监听方时静默失败。
 */
export function postLyricsOffset(offset: number) {
  try {
    const channel = new BroadcastChannel("play-list-store-sync-channel");
    channel.postMessage({
      from: "main",
      type: "lyricsOffset",
      offset,
      ts: Date.now(),
    });
    channel.close();
  } catch {
    // 广播不可用时静默忽略
  }
}

/**
 * 切换mini/完整播放模式
 */
export async function toggleMiniMode() {
  try {
    const isMiniWindow = window.location.hash.includes("mini-player");

    if (isMiniWindow) {
      stopMiniPlayerMainSync();
    } else {
      startMiniPlayerMainSync();
    }

    await window.electron.toggleMiniPlayer();
  } catch {
    addToast({
      title: "切换出错",
      color: "danger",
    });
  }
}
