import { useEffect, useState } from "react";

import { RiCloseLine, RiLockUnlockLine } from "@remixicon/react";
import { AnimatePresence, motion } from "framer-motion";

const textShadow = "0 2px 10px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.95)";

/** 把窗口背景透明化，只保留歌词内容 */
const useTransparentWindowStyle = () => {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const rootEl = document.querySelector<HTMLDivElement>("#root");

    root.style.background = "transparent";
    body.style.background = "transparent";
    body.style.margin = "0";
    body.style.overflow = "hidden";

    if (rootEl) {
      rootEl.style.background = "transparent";
      rootEl.style.overflow = "hidden";
    }

    return () => {
      root.style.removeProperty("background");
      body.style.removeProperty("background");
      body.style.removeProperty("margin");
      body.style.removeProperty("overflow");
      rootEl?.style.removeProperty("background");
      rootEl?.style.removeProperty("overflow");
    };
  }, []);
};

/**
 * 桌面悬浮歌词窗口页面（独立 BrowserWindow，透明置顶）
 *
 * 内容由主窗口通过 主进程 IPC 同步过来，只做展示与少量窗口交互；
 * 开关/锁定等设置以主窗口渲染进程为数据源。
 */
const DesktopLyrics = () => {
  useTransparentWindowStyle();

  const [payload, setPayload] = useState<DesktopLyricsPayload | null>(null);

  useEffect(() => {
    const offContent = window.electron.onDesktopLyricsContent(nextPayload => {
      if (nextPayload) setPayload(nextPayload);
    });

    // 窗口重载可能错过主进程的首次推送，这里主动拉取一次
    void window.electron.getDesktopLyricsContent().then(nextPayload => {
      if (nextPayload) setPayload(prev => prev ?? nextPayload);
    });

    return () => {
      offContent?.();
    };
  }, []);

  const locked = payload?.locked ?? true;
  const fontSize = payload?.fontSize ?? 32;
  const translationFontSize = Math.max(14, Math.round(fontSize * 0.55));
  const isInteractive = !locked;
  // 解锁后窗口可交互，常驻显示操作按钮：窗口本身是 drag 区域，拖拽区不会派发 hover 事件
  const showControls = isInteractive;

  return (
    <div
      className="window-drag relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: isInteractive ? "rgba(0, 0, 0, 0.18)" : "transparent",
        transition: "background 150ms ease",
      }}
    >
      {payload?.text ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${payload.playId}-${payload.index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: payload.isPlaying ? 1 : 0.82, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex w-full flex-col items-center justify-center px-8"
          >
            <span
              className="max-w-full truncate text-center font-extrabold text-white"
              style={{ fontSize, lineHeight: 1.25, textShadow }}
            >
              {payload.text}
            </span>
            {payload.translation ? (
              <span
                className="mt-1 max-w-full truncate text-center text-white/85"
                style={{ fontSize: translationFontSize, lineHeight: 1.3, textShadow }}
              >
                {payload.translation}
              </span>
            ) : null}
          </motion.div>
        </AnimatePresence>
      ) : (
        <span className="text-sm text-white/60" style={{ textShadow }}>
          歌词准备中...
        </span>
      )}

      {showControls ? (
        <div
          className="window-no-drag absolute top-1.5 right-2 flex items-center gap-1 rounded-full bg-black/55 px-1 py-0.5 backdrop-blur-md"
          onMouseDown={event => event.stopPropagation()}
        >
          <button
            type="button"
            title="锁定桌面歌词（鼠标穿透）"
            aria-label="锁定桌面歌词"
            className="cursor-pointer rounded-full p-1 text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            onClick={() => window.electron.requestDesktopLyricsToggleLock()}
          >
            <RiLockUnlockLine size={15} />
          </button>
          <button
            type="button"
            title="关闭桌面歌词"
            aria-label="关闭桌面歌词"
            className="cursor-pointer rounded-full p-1 text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            onClick={() => window.electron.requestDesktopLyricsToggle()}
          >
            <RiCloseLine size={15} />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default DesktopLyrics;
