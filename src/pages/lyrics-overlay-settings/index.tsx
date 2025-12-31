import { useEffect, useMemo, useRef, useState } from "react";

import { createLyricsBroadcastChannel } from "@/common/broadcast/lyrics-overlay-sync";
import { useSettings } from "@/store/settings";

type LyricsOverlaySettingsMessage =
  | {
      from: "overlay";
      data:
        | { type: "init" }
        | { type: "settings:update"; patch: Partial<AppSettings> }
        | { type: "lyrics:refresh" }
        | { type: "lyrics:manual-update"; title?: string; artist?: string };
      ts: number;
    }
  | {
      from: "main";
      data: {
        settings: Pick<
          AppSettings,
          | "lyricsOverlayFontSize"
          | "lyricsOverlayFontOpacity"
          | "lyricsOverlayFontColor"
          | "lyricsOverlayVisibleLines"
          | "lyricsOverlayOpacity"
          | "lyricsOverlayContentMaxWidth"
          | "lyricsOverlayContentHeight"
          | "lyricsOverlayWindowWidth"
          | "lyricsOverlayWindowHeight"
        >;
        type: "settings";
      };
      ts: number;
    }
  | {
      from: "main";
      data: {
        type: "meta";
        meta: {
          title?: string;
          artist?: string;
          resolvedTitle?: string;
          resolvedArtist?: string;
          mappedTitle?: string;
          mappedArtist?: string;
        };
      };
      ts: number;
    };

export default function LyricsOverlaySettings() {
  const initial = useSettings.getState();
  const [state, setState] = useState({
    fontSize: initial.lyricsOverlayFontSize,
    fontOpacity: initial.lyricsOverlayFontOpacity,
    fontColor: initial.lyricsOverlayFontColor,
    visibleLines: initial.lyricsOverlayVisibleLines,
    opacity: initial.lyricsOverlayOpacity,
    contentMaxWidth: initial.lyricsOverlayContentMaxWidth,
    contentHeight: initial.lyricsOverlayContentHeight,
    windowWidth: initial.lyricsOverlayWindowWidth,
    windowHeight: initial.lyricsOverlayWindowHeight,
    manualTitle: "",
    manualArtist: "",
  });
  const [meta, setMeta] = useState<{ mappedTitle?: string; mappedArtist?: string }>({});
  const titleDirtyRef = useRef(false);
  const artistDirtyRef = useRef(false);

  const bc = useMemo(() => createLyricsBroadcastChannel(), []);

  useEffect(() => {
    const postInit = () => {
      bc.postMessage({
        from: "overlay",
        data: { type: "init" },
        ts: Date.now(),
      } satisfies LyricsOverlaySettingsMessage);
    };
    postInit();
    const removeShowListener = window.electron.onLyricsOverlaySettingsShow(postInit);

    bc.onmessage = ev => {
      const msg = ev.data as LyricsOverlaySettingsMessage;
      if (!msg || msg.from !== "main") return;
      if (msg.data.type === "settings") {
        const s = msg.data.settings;
        setState(prev => ({
          ...prev,
          fontSize: s.lyricsOverlayFontSize,
          fontOpacity: s.lyricsOverlayFontOpacity,
          fontColor: s.lyricsOverlayFontColor,
          visibleLines: s.lyricsOverlayVisibleLines,
          opacity: s.lyricsOverlayOpacity,
          contentMaxWidth: s.lyricsOverlayContentMaxWidth,
          contentHeight: s.lyricsOverlayContentHeight,
          windowWidth: s.lyricsOverlayWindowWidth,
          windowHeight: s.lyricsOverlayWindowHeight,
        }));
        return;
      }

      if (msg.data.type === "meta") {
        const mappedTitle = msg.data.meta.mappedTitle?.trim();
        const mappedArtist = msg.data.meta.mappedArtist?.trim();
        setMeta({
          mappedTitle: mappedTitle || undefined,
          mappedArtist: mappedArtist || undefined,
        });
        titleDirtyRef.current = false;
        artistDirtyRef.current = false;
        setState(prev => ({
          ...prev,
          manualTitle: mappedTitle || "",
          manualArtist: mappedArtist || "",
        }));
      }
    };

    return () => {
      removeShowListener();
      bc.close();
    };
  }, [bc]);

  const postPatch = (patch: Partial<AppSettings>) => {
    bc.postMessage({
      from: "overlay",
      data: { type: "settings:update", patch },
      ts: Date.now(),
    } satisfies LyricsOverlaySettingsMessage);
  };

  const postRefresh = () => {
    bc.postMessage({
      from: "overlay",
      data: { type: "lyrics:refresh" },
      ts: Date.now(),
    } satisfies LyricsOverlaySettingsMessage);
  };

  const postManualUpdate = (title?: string, artist?: string) => {
    bc.postMessage({
      from: "overlay",
      data: { type: "lyrics:manual-update", title, artist },
      ts: Date.now(),
    } satisfies LyricsOverlaySettingsMessage);
  };

  const applyWindowSize = async (width: number, height: number) => {
    const w = Math.max(320, Math.floor(width));
    const h = Math.max(120, Math.floor(height));
    try {
      await window.electron.setLyricsOverlayBounds({ width: w, height: h });
    } catch {
      // ignore
    }
    postPatch({ lyricsOverlayWindowWidth: w, lyricsOverlayWindowHeight: h });
  };

  return (
    <div className="window-drag h-screen w-screen bg-transparent text-white">
      <div className="rounded-medium m-2 bg-black/75 p-3 text-xs backdrop-blur-md">
        <div className="window-drag mb-3 flex items-center justify-between">
          <div className="text-sm">桌面歌词设置</div>
          <button
            type="button"
            className="window-no-drag rounded-sm bg-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/20"
            onClick={() => window.electron.closeLyricsOverlaySettings()}
          >
            关闭
          </button>
        </div>

        <div className="window-no-drag grid grid-cols-2 gap-2">
          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>字号</span>
            <input
              className="w-[60px] bg-transparent text-right outline-none"
              type="number"
              min={12}
              max={48}
              step={1}
              value={state.fontSize}
              onChange={e => {
                const v = Number(e.target.value);
                setState(s => ({ ...s, fontSize: v }));
              }}
              onBlur={() => postPatch({ lyricsOverlayFontSize: state.fontSize })}
            />
          </label>

          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>字体透明</span>
            <input
              className="w-[60px] bg-transparent text-right outline-none"
              type="number"
              min={0.1}
              max={1}
              step={0.05}
              value={state.fontOpacity}
              onChange={e => {
                const v = Number(e.target.value);
                setState(s => ({ ...s, fontOpacity: v }));
              }}
              onBlur={() => postPatch({ lyricsOverlayFontOpacity: state.fontOpacity })}
            />
          </label>

          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>字体颜色</span>
            <input
              className="h-6 w-8 bg-transparent"
              type="color"
              value={state.fontColor}
              onChange={e => {
                const v = e.target.value;
                setState(s => ({ ...s, fontColor: v }));
                postPatch({ lyricsOverlayFontColor: v });
              }}
            />
          </label>

          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>显示行数</span>
            <input
              className="w-[60px] bg-transparent text-right outline-none"
              type="number"
              min={1}
              max={7}
              step={1}
              value={state.visibleLines}
              onChange={e => {
                const v = Number(e.target.value);
                setState(s => ({ ...s, visibleLines: v }));
              }}
              onBlur={() => postPatch({ lyricsOverlayVisibleLines: state.visibleLines })}
            />
          </label>

          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>区域宽</span>
            <input
              className="w-[60px] bg-transparent text-right outline-none"
              type="number"
              min={320}
              max={1800}
              step={20}
              value={state.contentMaxWidth}
              onChange={e => {
                const v = Number(e.target.value);
                setState(s => ({ ...s, contentMaxWidth: v }));
              }}
              onBlur={() => postPatch({ lyricsOverlayContentMaxWidth: state.contentMaxWidth })}
            />
          </label>

          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>区域高</span>
            <input
              className="w-[60px] bg-transparent text-right outline-none"
              type="number"
              min={60}
              max={500}
              step={5}
              value={state.contentHeight}
              onChange={e => {
                const v = Number(e.target.value);
                setState(s => ({ ...s, contentHeight: v }));
              }}
              onBlur={() => postPatch({ lyricsOverlayContentHeight: state.contentHeight })}
            />
          </label>

          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>窗宽</span>
            <input
              className="w-[60px] bg-transparent text-right outline-none"
              type="number"
              min={320}
              max={2400}
              step={20}
              value={state.windowWidth}
              onChange={e => {
                const v = Number(e.target.value);
                setState(s => ({ ...s, windowWidth: v }));
              }}
              onBlur={() => void applyWindowSize(state.windowWidth, state.windowHeight)}
            />
          </label>

          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>窗高</span>
            <input
              className="w-[60px] bg-transparent text-right outline-none"
              type="number"
              min={120}
              max={1200}
              step={10}
              value={state.windowHeight}
              onChange={e => {
                const v = Number(e.target.value);
                setState(s => ({ ...s, windowHeight: v }));
              }}
              onBlur={() => void applyWindowSize(state.windowWidth, state.windowHeight)}
            />
          </label>

          <label className="window-no-drag col-span-2 flex items-center justify-between gap-2 rounded-sm bg-white/10 px-2 py-1">
            <span>手动歌名</span>
            <input
              className="flex-1 bg-transparent text-right outline-none"
              type="text"
              placeholder={meta.mappedTitle || "留空自动识别"}
              value={state.manualTitle}
              onChange={e => {
                const v = e.target.value;
                titleDirtyRef.current = true;
                setState(s => ({ ...s, manualTitle: v }));
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => {
                if (!titleDirtyRef.current) return;
                postManualUpdate(state.manualTitle, undefined);
                titleDirtyRef.current = false;
              }}
            />
          </label>

          <label className="window-no-drag col-span-2 flex items-center justify-between gap-2 rounded-sm bg-white/10 px-2 py-1">
            <span>手动歌手</span>
            <input
              className="flex-1 bg-transparent text-right outline-none"
              type="text"
              placeholder={meta.mappedArtist || "留空自动识别"}
              value={state.manualArtist}
              onChange={e => {
                const v = e.target.value;
                artistDirtyRef.current = true;
                setState(s => ({ ...s, manualArtist: v }));
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              onBlur={() => {
                if (!artistDirtyRef.current) return;
                postManualUpdate(undefined, state.manualArtist);
                artistDirtyRef.current = false;
              }}
            />
          </label>

          <div className="window-no-drag col-span-2 flex items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-sm bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/20"
              onClick={() => {
                const title = titleDirtyRef.current ? state.manualTitle : (meta.mappedTitle ?? "");
                const artist = artistDirtyRef.current ? state.manualArtist : (meta.mappedArtist ?? "");
                postManualUpdate(title, artist);
                postRefresh();
                titleDirtyRef.current = false;
                artistDirtyRef.current = false;
              }}
            >
              立即刷新
            </button>
          </div>

          <label className="window-no-drag flex items-center justify-between rounded-sm bg-white/10 px-2 py-1">
            <span>整体透明</span>
            <input
              className="w-[60px] bg-transparent text-right outline-none"
              type="number"
              min={0.2}
              max={1}
              step={0.05}
              value={state.opacity}
              onChange={e => {
                const v = Number(e.target.value);
                setState(s => ({ ...s, opacity: v }));
              }}
              onBlur={() => postPatch({ lyricsOverlayOpacity: state.opacity })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
