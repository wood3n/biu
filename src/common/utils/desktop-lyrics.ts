import { shallow } from "zustand/shallow";

import { normalizeAnimationFps } from "@/common/audio/frame-rate";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";
import { useSettings } from "@/store/settings";

import type { MiniPlayerMainStateSnapshot } from "./mini-player";

import { getMainStateSnapshot } from "./mini-player";

/** 桌面歌词独立同步通道：不与 mini 播放器共用，避免同一状态被推送两次 */
const CHANNEL_NAME = "desktop-lyrics-sync-channel";

export const DESKTOP_LYRICS_FONT_SIZE_MIN = 18;
export const DESKTOP_LYRICS_FONT_SIZE_MAX = 60;
export const DESKTOP_LYRICS_FONT_SIZE_STEP = 2;

/** 一行歌词最多占多少屏幕宽度（百分比），由主进程拿去 resize 歌词条窗口 */
export const DESKTOP_LYRICS_WIDTH_MIN = 30;
/** 上限不到 100%：留一点缝隙，别让一条透明横带铺满整个工作区 */
export const DESKTOP_LYRICS_WIDTH_MAX = 95;
export const DESKTOP_LYRICS_WIDTH_STEP = 5;
export const DESKTOP_LYRICS_WIDTH_DEFAULT = 70;

/** 歌词条渲染需要的一组设置（主窗口是唯一写入方，整包推给歌词条） */
export interface DesktopLyricsViewSettings {
  fontFamily: string;
  fontSize: number;
  locked: boolean;
  color: string;
  activeColor: string;
  lineMode: "single" | "double";
  /** 上色边界的推进帧率：歌词条自己不写设置，只能靠这包镜像拿到当前档位 */
  animationFps: number;
}

/** 歌词条自身不写设置（多窗口各持一份内存 store，写盘会互相覆盖），所有改动都交给主窗口落盘 */
export type DesktopLyricsCommand =
  | { type: "init" }
  | { type: "close" }
  | { type: "toggleLock" }
  | { type: "fontSize"; value: number }
  | { type: "togglePlay" }
  | { type: "prev" }
  | { type: "next" };

interface MessageFromLyrics {
  from: "desktop-lyrics";
  data?: DesktopLyricsCommand;
  ts?: number;
}

interface MessageFromMain {
  from: "main";
  type: "state" | "lyricsOffset" | "settings";
  state?: MiniPlayerMainStateSnapshot;
  offset?: number;
  settings?: DesktopLyricsViewSettings;
  ts: number;
}

let bc: BroadcastChannel | null = null;
let unsubscribes: VoidFunction[] = [];
let isBroadcasting = false;

export function createDesktopLyricsChannel() {
  return new BroadcastChannel(CHANNEL_NAME);
}

function postToLyrics(message: Omit<MessageFromMain, "ts">) {
  bc?.postMessage({ ...message, ts: Date.now() } satisfies MessageFromMain);
}

/** 取当前桌面歌词渲染设置（字号做边界收敛，防旧持久化值越界） */
function pickDesktopLyricsView(state: AppSettings): DesktopLyricsViewSettings {
  return {
    fontFamily: state.desktopLyricsFontFamily,
    fontSize: clampDesktopLyricsFontSize(state.desktopLyricsFontSize),
    locked: state.desktopLyricsLocked,
    color: state.desktopLyricsColor,
    activeColor: state.desktopLyricsActiveColor,
    lineMode: state.desktopLyricsLineMode,
    animationFps: normalizeAnimationFps(state.animationFps),
  };
}

function readDesktopLyricsViewSettings() {
  return pickDesktopLyricsView(useSettings.getState());
}

/** 歌词条自己的 settings 副本不会二次水合，渲染参数只能由主窗口推送过来 */
function postSettingsToLyrics() {
  postToLyrics({ from: "main", type: "settings", settings: readDesktopLyricsViewSettings() });
}

function clampDesktopLyricsFontSize(value: number) {
  if (!Number.isFinite(value)) return DESKTOP_LYRICS_FONT_SIZE_MIN;
  return Math.min(DESKTOP_LYRICS_FONT_SIZE_MAX, Math.max(DESKTOP_LYRICS_FONT_SIZE_MIN, Math.round(value)));
}

function handleMessageFromLyrics(command: DesktopLyricsCommand) {
  const updateSettings = useSettings.getState().update;

  switch (command.type) {
    case "init": {
      postToLyrics({ from: "main", type: "state", state: getMainStateSnapshot() });
      postSettingsToLyrics();
      break;
    }
    case "close": {
      // 主窗口的 desktopLyricsEnabled 订阅负责销毁歌词条窗口
      updateSettings({ desktopLyricsEnabled: false });
      break;
    }
    case "toggleLock": {
      updateSettings({ desktopLyricsLocked: !useSettings.getState().desktopLyricsLocked });
      break;
    }
    case "fontSize": {
      updateSettings({ desktopLyricsFontSize: clampDesktopLyricsFontSize(command.value) });
      break;
    }
    // 播放控制由主窗口承担：歌词条自己没有 audio 元素
    case "togglePlay": {
      usePlayList.getState().togglePlay();
      break;
    }
    case "prev": {
      void usePlayList.getState().prev();
      break;
    }
    case "next": {
      void usePlayList.getState().next();
      break;
    }
    default: {
      break;
    }
  }
}

/**
 * 启动主窗口 -> 桌面歌词窗口的状态同步。
 *
 * 只会启动一次；重复调用直接返回。
 * 播放列表/进度变化推送给歌词条；歌词条的工具按钮命令回传到这里执行。
 */
function startDesktopLyricsMainSync() {
  if (isBroadcasting) return;

  bc = createDesktopLyricsChannel();
  isBroadcasting = true;

  bc.onmessage = ev => {
    const data = ev.data as MessageFromLyrics;
    if (data?.from !== "desktop-lyrics" || !data.data) return;
    handleMessageFromLyrics(data.data);
  };

  // 开机恢复的歌词条可能早于主窗口水合就已 mount，错过它自己发的 init，这里主动补推一次
  postToLyrics({ from: "main", type: "state", state: getMainStateSnapshot() });
  postSettingsToLyrics();

  // 切歌/播放状态变化去重推送，进度变化逐次推送（歌词逐行与逐字进度都依赖它）
  unsubscribes.push(
    usePlayList.subscribe((state, prevState) => {
      if (
        !shallow(
          {
            playId: state.playId,
            isPlaying: state.isPlaying,
            playMode: state.playMode,
            duration: state.duration,
            rate: state.rate,
          },
          {
            playId: prevState.playId,
            isPlaying: prevState.isPlaying,
            playMode: prevState.playMode,
            duration: prevState.duration,
            rate: prevState.rate,
          },
        )
      ) {
        postToLyrics({ from: "main", type: "state", state: getMainStateSnapshot() });
      }
    }),
    usePlayProgress.subscribe((state, prevState) => {
      if (state.currentTime !== prevState.currentTime) {
        postToLyrics({ from: "main", type: "state", state: getMainStateSnapshot() });
      }
    }),
    useSettings.subscribe((state, prevState) => {
      if (!shallow(pickDesktopLyricsView(state), pickDesktopLyricsView(prevState))) {
        postSettingsToLyrics();
      }
    }),
  );
}

function stopDesktopLyricsMainSync() {
  if (!isBroadcasting) return;

  unsubscribes.forEach(unsubscribe => unsubscribe());
  unsubscribes = [];
  bc?.close();
  bc = null;
  isBroadcasting = false;
}

/**
 * 歌词偏移实时同步给桌面歌词窗口。
 * 临时创建通道发送后立即关闭；无监听方时静默失败。
 */
export function postDesktopLyricsOffset(offset: number) {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ from: "main", type: "lyricsOffset", offset, ts: Date.now() } satisfies MessageFromMain);
    channel.close();
  } catch {
    // 广播不可用时静默忽略
  }
}

/** 覆盖窗（小窗 / 歌词条）不做控制器，否则同一份状态会被多个窗口重复广播 */
function isOverlayWindow() {
  const { hash } = window.location;
  return hash.includes("mini-player") || hash.includes("desktop-lyrics");
}

/**
 * 主窗口的桌面歌词控制器：设置项是唯一事实来源。
 *
 * 开关变化 → 创建/销毁歌词条窗口并启停状态广播；锁定变化 → 切换鼠标穿透。
 * 主进程启动时已按持久化设置恢复过窗口，这里只处理水合之后的变化。
 *
 * @returns 清理函数
 */
export function startDesktopLyricsController() {
  if (isOverlayWindow() || !window.electron || !window.electron.setDesktopLyricsVisible) {
    return () => {};
  }

  const apply = (enabled: boolean, locked: boolean, width: number) => {
    window.electron.setDesktopLyricsVisible(enabled);
    window.electron.setDesktopLyricsLocked(locked);
    // 窗口宽度即「一行最多占多少屏幕」，铺满整屏会把一条透明横带留在桌面上
    window.electron.setDesktopLyricsWidth(width);

    if (enabled) {
      startDesktopLyricsMainSync();
    } else {
      stopDesktopLyricsMainSync();
    }
  };

  // 水合可能早于本 effect 执行，此时没有"变化"可订阅，按当前值补一次（创建窗口是幂等的）
  if (useSettings.persist.hasHydrated()) {
    const { desktopLyricsEnabled, desktopLyricsLocked, desktopLyricsWidth } = useSettings.getState();
    apply(desktopLyricsEnabled, desktopLyricsLocked, desktopLyricsWidth);
  }

  const unsubscribe = useSettings.subscribe((state, prevState) => {
    const enabledChanged = state.desktopLyricsEnabled !== prevState.desktopLyricsEnabled;
    const lockedChanged = state.desktopLyricsLocked !== prevState.desktopLyricsLocked;
    const widthChanged = state.desktopLyricsWidth !== prevState.desktopLyricsWidth;
    if (!enabledChanged && !lockedChanged && !widthChanged) {
      return;
    }
    apply(state.desktopLyricsEnabled, state.desktopLyricsLocked, state.desktopLyricsWidth);
  });

  return () => {
    unsubscribe();
    stopDesktopLyricsMainSync();
  };
}
