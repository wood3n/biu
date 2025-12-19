import { addToast } from "@heroui/react";
import { shallow } from "zustand/shallow";

import type { PlayMode } from "@/common/constants/audio";

import { usePlayList } from "@/store/play-list";

export type MiniPlayerCommandFromMini = "init" | "seek" | "togglePlayMode" | "next" | "prev" | "togglePlay";

export interface MiniPlayerMainStateSnapshot {
  isSingle: boolean;
  isPlaying: boolean;
  title?: string;
  cover?: string;
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

export interface MiniPlayerMessageFromMain {
  from: "main";
  state: MiniPlayerMainStateSnapshot;
  ts: number;
}

export interface MiniPlayerMainSyncState {
  isBroadcasting: boolean;
}

let bc: BroadcastChannel | null = null;
let unsubscribePlayList: VoidFunction | null = null;
let isBroadcasting = false;

export function createBroadcastChannel() {
  return new BroadcastChannel("play-list-store-sync-channel");
}

function getMainStateSnapshot(): MiniPlayerMainStateSnapshot {
  const { list, isPlaying, currentTime, playMode, duration, playId, getPlayItem } = usePlayList.getState();
  const playItem = getPlayItem();

  return {
    isSingle: list.length === 1,
    title: playItem?.pageTitle || playItem?.title,
    cover: playItem?.pageCover || playItem?.cover,
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
    state: getMainStateSnapshot(),
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
      break;
    }
    case "seek": {
      const t = data.state?.currentTime;
      if (typeof t === "number" && Number.isFinite(t)) {
        usePlayList.getState().seek(t);
      }
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
 * - 收到 mini 端的 `init/seek/next/prev/togglePlay/togglePlayMode` 会转发到主播放状态。
 * - 主播放状态发生变化会推送给 mini 端更新 UI。
 */
export function startMiniPlayerMainSync() {
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
          currentTime: state.currentTime,
          duration: state.duration,
        },
        {
          playId: prevState.playId,
          isPlaying: prevState.isPlaying,
          playMode: prevState.playMode,
          currentTime: prevState.currentTime,
          duration: prevState.duration,
        },
      )
    ) {
      postMainState(bc as BroadcastChannel);
    }
  });
}

/**
 * 停止主窗口 -> mini 播放器的状态同步通道。
 */
export function stopMiniPlayerMainSync() {
  if (!isBroadcasting) return;

  unsubscribePlayList?.();
  unsubscribePlayList = null;
  bc?.close();
  bc = null;
  isBroadcasting = false;
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
