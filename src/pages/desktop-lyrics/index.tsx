import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RiCloseLine, RiLockUnlockFill, RiLockFill } from "@remixicon/react";
import clx from "classnames";

import { createBroadcastChannel } from "@/common/utils/mini-player";
import IconButton from "@/components/icon-button";
import { getLyricsByBili } from "@/components/lyrics/get-lyrics";
import { useSettings } from "@/store/settings";
import { StoreNameMap } from "@shared/store";

type LyricLine = {
  time: number;
  text: string;
};

const DEFAULT_OFFSET = 0;

export default function DesktopLyrics() {
  // 强制透明背景，阻止全局 Theme 或 HeroUI 设置的不透明背板遮挡桌面
  useEffect(() => {
    document.documentElement.style.setProperty("background", "transparent", "important");
    document.body.style.setProperty("background", "transparent", "important");
    const rootEl = document.getElementById("root");
    if (rootEl) {
      rootEl.style.setProperty("background", "transparent", "important");
    }
    return () => {
      document.documentElement.style.removeProperty("background");
      document.body.style.removeProperty("background");
      rootEl?.style.removeProperty("background");
    };
  }, []);

  const [currentTime, setCurrentTime] = useState(0);
  const [playState, setPlayState] = useState<{ bvid?: string; cid?: string | number; aid?: string | number }>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      if (isLocked) {
        window.electron.setDesktopLyricsIgnoreMouseEvents(true, { forward: true });
      }
    }, 400); // 增加一点延迟，防止从文字移向按钮时中间的透明空隙触发离开
  };

  const fontSize = useSettings(s => s.desktopLyricsFontSize) || 36;
  const fontColor = useSettings(s => s.desktopLyricsColor) || "#60a5fa";
  const fontFamily = useSettings(s => s.desktopLyricsFontFamily) || "system-ui";

  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [offset, setOffset] = useState(DEFAULT_OFFSET);

  const bcRef = useRef<BroadcastChannel | null>(null);

  // Parse LRC
  const parseLrc = useCallback((raw?: string | null) => {
    if (!raw) return [] as LyricLine[];
    const result: LyricLine[] = [];
    const lines = raw.split(/\r?\n/);
    const timeTagPattern = /\[(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\]/g;

    lines.forEach(line => {
      const text = line.replace(timeTagPattern, "").trim();
      if (!text) return;

      let match: RegExpExecArray | null;
      while ((match = timeTagPattern.exec(line)) !== null) {
        const minutes = Number(match[1]);
        const seconds = Number(match[2]);
        const millis = match[3] ? Number(match[3].padEnd(3, "0")) : 0;

        if (Number.isNaN(minutes) || Number.isNaN(seconds) || Number.isNaN(millis)) continue;

        const time = Math.max(0, minutes * 60 * 1000 + seconds * 1000 + millis);
        result.push({ time, text });
      }

      timeTagPattern.lastIndex = 0;
    });

    return result.toSorted((a, b) => a.time - b.time);
  }, []);

  // Listen to broadcast state
  useEffect(() => {
    bcRef.current = createBroadcastChannel();
    // ask for init state
    bcRef.current.postMessage({ from: "mini", data: { type: "init" }, ts: Date.now() });

    bcRef.current.onmessage = ev => {
      const { from, state } = ev.data || {};
      if (from !== "main" || !state) return;

      if (typeof state.currentTime === "number") {
        setCurrentTime(state.currentTime);
      }
      setPlayState({ bvid: state.bvid, cid: state.cid, aid: state.aid });
    };

    return () => {
      bcRef.current?.close();
    };
  }, []);

  // Fetch / Sync Lock State
  useEffect(() => {
    const unsubscribe = window.electron.onDesktopLyricsLockChange(setIsLocked);
    return unsubscribe;
  }, []);

  // Fetch Lyrics
  useEffect(() => {
    let canceled = false;
    setOffset(DEFAULT_OFFSET);

    const fetchLyrics = async () => {
      if (!playState.cid) {
        setLyrics([]);
        return;
      }
      const cidAsNumber = Number(playState.cid);
      if (Number.isNaN(cidAsNumber)) return;

      try {
        const store = await window.electron.getStore(StoreNameMap.LyricsCache);
        if (store && typeof store === "object") {
          const cached = store[`${playState.bvid}-${playState.cid}`];
          if (cached) {
            setOffset(typeof cached.offset === "number" ? cached.offset : DEFAULT_OFFSET);
            if (cached.lyrics) {
              if (canceled) return;
              setLyrics(parseLrc(cached.lyrics));
              return;
            }
          }
        }

        const params: any = { cid: cidAsNumber };
        if (playState.bvid) params.bvid = playState.bvid;
        if (playState.aid) params.aid = Number(playState.aid);

        const body = await getLyricsByBili(params);
        if (canceled) return;
        setLyrics(body?.length ? body : []);
      } catch {
        if (canceled) return;
        setLyrics([]);
      }
    };

    void fetchLyrics();
    return () => {
      canceled = true;
    };
  }, [playState.bvid, playState.cid, playState.aid, parseLrc]);

  // Current MS calculation
  const currentMs = currentTime * 1000 + offset;
  const activeIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    for (let i = lyrics.length - 1; i >= 0; i -= 1) {
      if (currentMs >= lyrics[i].time) return i;
    }
    return 0;
  }, [currentMs, lyrics]);

  const activeLyric = activeIndex >= 0 ? lyrics[activeIndex].text : "听你想听的";
  const lockToggle = () => {
    window.electron.setDesktopLyricsLock(!isLocked);
    if (!isLocked) {
      // 当上锁时，强制隐藏悬浮按钮，防止在透传模式下留下残影
      setIsHovered(false);
      window.electron.setDesktopLyricsIgnoreMouseEvents(true, { forward: true });
    }
  };
  const closeWindow = () => {
    window.electron.toggleDesktopLyrics();
  };

  return (
    <div
      className={clx(
        "flex h-screen w-screen flex-col items-center justify-center overflow-hidden transition-all duration-300",
        {
          "window-drag": !isLocked,
          "window-no-drag": isLocked,
          "bg-black/20": isHovered && !isLocked,
        },
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={clx("absolute top-2 flex w-full justify-center gap-4 transition-opacity duration-300", {
          "opacity-100": isHovered,
          "pointer-events-none opacity-0": !isHovered,
        })}
      >
        <div
          onMouseEnter={() => {
            handleMouseEnter();
            if (isLocked) {
              window.electron.setDesktopLyricsIgnoreMouseEvents(false);
            }
          }}
          onMouseLeave={() => {
            handleMouseLeave();
          }}
        >
          <IconButton
            title={isLocked ? "解锁 (Unlock)" : "锁定 (Lock)"}
            onPress={lockToggle}
            className="window-no-drag pointer-events-auto text-white hover:text-white"
          >
            {isLocked ? <RiLockFill size={18} /> : <RiLockUnlockFill size={18} />}
          </IconButton>
        </div>
        {!isLocked && (
          <IconButton
            title="关闭"
            onPress={closeWindow}
            className="window-no-drag pointer-events-auto text-white hover:text-white"
          >
            <RiCloseLine size={20} />
          </IconButton>
        )}
      </div>

      <div className="flex w-full justify-center px-6 text-center drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
        <span
          style={{
            WebkitTextStroke: "1px rgba(0,0,0,0.6)", // Text stroke for visibility on light/dark backgrounds
            paintOrder: "stroke fill",
            color: fontColor, // 使用设置的颜色
            fontSize: `${fontSize}px`, // 使用设置的字体大小
            fontFamily: fontFamily, // 使用设置的字体
            textShadow: "0px 2px 4px rgba(0,0,0,1)",
          }}
          className="leading-tight font-bold tracking-wider text-white transition-all"
        >
          {activeLyric}
        </span>
      </div>
    </div>
  );
}
