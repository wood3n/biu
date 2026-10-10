import { useCallback, useEffect, useRef, useState } from "react";

import {
  createDesktopLyricsChannel,
  type DesktopLyricsCommandType,
  type DesktopLyricsMessageFromMain,
  type DesktopLyricsSnapshot,
} from "@/common/utils/desktop-lyrics";

const emptySnapshot: DesktopLyricsSnapshot = {
  currentTime: 0,
  duration: 0,
  hasTrack: false,
  isPlaying: false,
};

/** 未收到主窗口状态时的重试间隔（毫秒） */
const INIT_RETRY_INTERVAL = 3000;

/**
 * 桌面歌词窗口：订阅主窗口推送的播放状态，并向主窗口发送控制命令
 */
export const useDesktopLyricsSync = () => {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const receivedRef = useRef(false);
  const [snapshot, setSnapshot] = useState<DesktopLyricsSnapshot>(emptySnapshot);
  /** 主界面歌词更新后自增，用于触发歌词缓存重读 */
  const [lyricsRevision, setLyricsRevision] = useState(0);

  useEffect(() => {
    const channel = createDesktopLyricsChannel();
    channelRef.current = channel;

    const requestState = () => {
      if (receivedRef.current) return;

      channel.postMessage({
        data: { type: "init" },
        from: "lyrics",
        ts: Date.now(),
      });
    };

    channel.onmessage = event => {
      const message = event.data as DesktopLyricsMessageFromMain;
      if (message?.from !== "main") return;

      if (message.event === "lyricsUpdated") {
        setLyricsRevision(revision => revision + 1);

        return;
      }

      if (!message.state) return;

      receivedRef.current = true;
      setSnapshot(message.state);
    };

    // 歌词窗口可能比主窗口的广播更早挂载，收到状态前持续请求
    requestState();
    const retryTimer = window.setInterval(requestState, INIT_RETRY_INTERVAL);

    return () => {
      window.clearInterval(retryTimer);
      channel.close();
      channelRef.current = null;
    };
  }, []);

  const sendCommand = useCallback((type: DesktopLyricsCommandType, state?: { currentTime?: number }) => {
    channelRef.current?.postMessage({
      data: { state, type },
      from: "lyrics",
      ts: Date.now(),
    });
  }, []);

  return { lyricsRevision, sendCommand, snapshot };
};
