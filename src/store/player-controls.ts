import { create } from "zustand";
import { persist } from "zustand/middleware";

import { PlayMode } from "@/common/constants";

interface PlayerControlsState {
  // 播放/暂停
  isPlaying: boolean;
  // 静音
  isMuted: boolean;
  // 音量 0-100
  volume: number;
  // 播放模式
  playMode: PlayMode;
  // 播放速率（0.5x - 2.0x）
  rate: number;
  // 当前时间（毫秒）
  currentTime: number;
  // 总时长（毫秒）
  duration: number;
}

interface PlayerControlsAction {
  setPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void; // 0-100
  setPlayMode: (mode: PlayMode) => void;
  setRate: (rate: number) => void; // 0.5-2.0
  setCurrentTime: (ms: number) => void;
  setDuration: (ms: number) => void;
  reset: () => void;
}

const initControlsState: PlayerControlsState = {
  isPlaying: false,
  isMuted: false,
  volume: 50,
  playMode: PlayMode.Loop,
  rate: 1,
  currentTime: 0,
  duration: 0,
};

/** 播放控制（独立状态） */
export const usePlayerControls = create<PlayerControlsState & PlayerControlsAction>()(
  persist(
    set => ({
      ...initControlsState,

      setPlaying: playing => set({ isPlaying: playing }),
      togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),
      setMuted: muted => set({ isMuted: muted }),
      toggleMute: () => set(s => ({ isMuted: !s.isMuted })),
      setVolume: volume => {
        const v = Math.max(0, Math.min(100, Math.round(volume)));
        set({ volume: v });
      },
      setPlayMode: mode => set({ playMode: mode }),
      setRate: rate => {
        const r = Math.max(0.5, Math.min(2, rate));
        set({ rate: r });
      },
      setCurrentTime: ms => set({ currentTime: Math.max(0, Math.floor(ms)) }),
      setDuration: ms => set({ duration: Math.max(0, Math.floor(ms)) }),
      reset: () => set({ ...initControlsState }),
    }),
    {
      name: "player-controls",
      partialize: state => ({
        isPlaying: state.isPlaying,
        isMuted: state.isMuted,
        volume: state.volume,
        playMode: state.playMode,
        rate: state.rate,
        currentTime: state.currentTime,
        duration: state.duration,
      }),
    },
  ),
);
