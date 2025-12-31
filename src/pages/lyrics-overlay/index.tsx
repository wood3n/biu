import { useEffect, useMemo, useRef, useState } from "react";

import clx from "classnames";
import { useShallow } from "zustand/react/shallow";

import { createLyricsBroadcastChannel } from "@/common/broadcast/lyrics-overlay-sync";
import { getActiveLrcIndex } from "@/common/utils/lrc";
import { useLyrics } from "@/store/lyrics";
import { useSettings } from "@/store/settings";

type LyricsOverlayStateMessage =
  | {
      from: "overlay";
      data: { type: "init" } | { type: "offset:update"; mediaKey: string; offsetSeconds: number };
      ts: number;
    }
  | {
      from: "main";
      data:
        | {
            type: "state";
            state: {
              mediaKey?: string;
              title?: string;
              artist?: string;
              isPlaying: boolean;
              currentTime?: number;
              lyricsOffsetSeconds?: number;
            };
          }
        | {
            type: "lyrics";
            lyrics: {
              title?: string;
              artist?: string;
              status: "idle" | "loading" | "ready" | "error";
              raw?: string;
              error?: string;
            };
          }
        | {
            type: "settings";
            settings: Pick<
              AppSettings,
              | "lyricsOverlayFontSize"
              | "lyricsOverlayOpacity"
              | "lyricsOverlayContentMaxWidth"
              | "lyricsOverlayContentHeight"
              | "lyricsOverlayWindowWidth"
              | "lyricsOverlayWindowHeight"
              | "lyricsOverlayBackgroundColor"
              | "lyricsOverlayBackgroundOpacity"
              | "lyricsOverlayFontColor"
              | "lyricsOverlayFontOpacity"
              | "lyricsOverlayVisibleLines"
              | "lyricsOverlayPanelX"
              | "lyricsOverlayPanelY"
            >;
          };
      ts: number;
    };

function hexToRgb(hex: string) {
  const normalized = hex.trim().replace("#", "");
  if (![3, 6].includes(normalized.length)) return null;
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map(c => c + c)
          .join("")
      : normalized;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(v => Number.isNaN(v))) return null;
  return { r, g, b };
}

export default function LyricsOverlay() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [playerState, setPlayerState] = useState<{
    mediaKey?: string;
    title?: string;
    artist?: string;
    isPlaying: boolean;
    currentTime?: number;
  }>({ isPlaying: false });

  const { status, lines, error } = useLyrics(
    useShallow(s => ({
      status: s.status,
      title: s.title,
      artist: s.artist,
      lines: s.lines,
      error: s.error,
    })),
  );

  const initialSettings = useSettings.getState();
  const [overlaySettings, setOverlaySettings] = useState<{
    fontSize: number;
    opacity: number;
    contentMaxWidth: number;
    contentHeight: number;
    windowWidth: number;
    windowHeight: number;
    backgroundColor: string;
    backgroundOpacity: number;
    fontColor: string;
    fontOpacity: number;
    visibleLines: number;
    panelX: number;
    panelY: number;
  }>({
    fontSize: initialSettings.lyricsOverlayFontSize,
    opacity: initialSettings.lyricsOverlayOpacity,
    contentMaxWidth: initialSettings.lyricsOverlayContentMaxWidth,
    contentHeight: initialSettings.lyricsOverlayContentHeight,
    windowWidth: initialSettings.lyricsOverlayWindowWidth,
    windowHeight: initialSettings.lyricsOverlayWindowHeight,
    backgroundColor: initialSettings.lyricsOverlayBackgroundColor,
    backgroundOpacity: initialSettings.lyricsOverlayBackgroundOpacity,
    fontColor: initialSettings.lyricsOverlayFontColor,
    fontOpacity: initialSettings.lyricsOverlayFontOpacity,
    visibleLines: initialSettings.lyricsOverlayVisibleLines,
    panelX: initialSettings.lyricsOverlayPanelX,
    panelY: initialSettings.lyricsOverlayPanelY,
  });

  const [lyricsOffsetSeconds, setLyricsOffsetSeconds] = useState(0);

  const activeIndex = useMemo(
    () =>
      getActiveLrcIndex(
        lines,
        typeof playerState.currentTime === "number" ? playerState.currentTime + lyricsOffsetSeconds : undefined,
      ),
    [lines, lyricsOffsetSeconds, playerState.currentTime],
  );

  const activeLine = activeIndex >= 0 ? lines[activeIndex] : undefined;
  const nextLine = activeIndex >= 0 ? lines[activeIndex + 1] : undefined;
  const lineStart = activeLine?.time;
  const lineEnd = nextLine?.time ?? (typeof lineStart === "number" ? lineStart + 6 : undefined);
  const lineProgress = useMemo(() => {
    if (!activeLine) return 0;
    const ct = typeof playerState.currentTime === "number" ? playerState.currentTime + lyricsOffsetSeconds : undefined;
    if (typeof ct !== "number") return 0;
    if (typeof lineStart !== "number" || typeof lineEnd !== "number") return 0;
    const dur = Math.max(0.1, lineEnd - lineStart);
    const p = (ct - lineStart) / dur;
    return Math.max(0, Math.min(1, p));
  }, [activeLine, lineEnd, lineStart, playerState.currentTime]);

  const tokenize = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return [] as string[];
    if (/\s/.test(trimmed)) return trimmed.split(/\s+/g).filter(Boolean);
    return Array.from(trimmed);
  };

  const tokens = useMemo(() => tokenize(activeLine?.text ?? ""), [activeLine?.text]);
  const activeTokenIndex = useMemo(() => {
    if (!tokens.length) return -1;
    const idx = Math.floor(lineProgress * tokens.length);
    return Math.max(0, Math.min(tokens.length - 1, idx));
  }, [lineProgress, tokens.length]);

  const tokenContainerRef = useRef<HTMLDivElement | null>(null);
  const activeTokenElRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const container = tokenContainerRef.current;
    const activeEl = activeTokenElRef.current;
    if (!container || !activeEl) return;
    const left = activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2;
    container.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeTokenIndex, activeIndex]);

  useEffect(() => {
    bcRef.current = createLyricsBroadcastChannel();
    bcRef.current.postMessage({
      from: "overlay",
      data: { type: "init" },
      ts: Date.now(),
    } satisfies LyricsOverlayStateMessage);

    bcRef.current.onmessage = ev => {
      const msg = ev.data as LyricsOverlayStateMessage;
      if (!msg || msg.from !== "main") return;

      if (msg.data.type === "state") {
        setPlayerState(msg.data.state);
        if (msg.data.state.mediaKey) {
          setLyricsOffsetSeconds(msg.data.state.lyricsOffsetSeconds ?? 0);
        }
        return;
      }

      if (msg.data.type === "lyrics") {
        const { lyrics } = msg.data;
        if (lyrics.status === "loading") {
          useLyrics.getState().setLoading({ title: lyrics.title, artist: lyrics.artist });
        } else if (lyrics.status === "ready") {
          useLyrics.getState().setLyrics({ title: lyrics.title, artist: lyrics.artist, raw: lyrics.raw });
        } else if (lyrics.status === "error") {
          useLyrics.getState().setError({
            title: lyrics.title,
            artist: lyrics.artist,
            error: lyrics.error || "歌词获取失败",
          });
        } else {
          useLyrics.getState().reset();
        }
        return;
      }

      if (msg.data.type === "settings") {
        const s = msg.data.settings;
        setOverlaySettings({
          fontSize: s.lyricsOverlayFontSize,
          opacity: s.lyricsOverlayOpacity,
          contentMaxWidth: s.lyricsOverlayContentMaxWidth,
          contentHeight: s.lyricsOverlayContentHeight,
          windowWidth: s.lyricsOverlayWindowWidth,
          windowHeight: s.lyricsOverlayWindowHeight,
          backgroundColor: s.lyricsOverlayBackgroundColor,
          backgroundOpacity: s.lyricsOverlayBackgroundOpacity,
          fontColor: s.lyricsOverlayFontColor,
          fontOpacity: s.lyricsOverlayFontOpacity,
          visibleLines: s.lyricsOverlayVisibleLines,
          panelX: s.lyricsOverlayPanelX,
          panelY: s.lyricsOverlayPanelY,
        });
      }
    };

    return () => {
      bcRef.current?.close();
      bcRef.current = null;
    };
  }, []);

  const updateOffset = (next: number) => {
    const clamped = Math.max(-600, Math.min(600, Math.round(next * 100) / 100));
    setLyricsOffsetSeconds(clamped);
    const mediaKey = playerState.mediaKey;
    if (!mediaKey) return;
    bcRef.current?.postMessage({
      from: "overlay",
      data: { type: "offset:update", mediaKey, offsetSeconds: clamped },
      ts: Date.now(),
    } satisfies LyricsOverlayStateMessage);
  };

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "ArrowLeft") {
        ev.preventDefault();
        updateOffset(lyricsOffsetSeconds - 0.5);
      } else if (ev.key === "ArrowRight") {
        ev.preventDefault();
        updateOffset(lyricsOffsetSeconds + 0.5);
      } else if (ev.key === "Escape") {
        updateOffset(0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lyricsOffsetSeconds, playerState.mediaKey]);

  // const headerTitle = title || playerState.title || "未播放";
  // const headerArtist = artist || playerState.artist || "";
  const fontSize = overlaySettings.fontSize;
  const opacity = overlaySettings.opacity;
  const contentMaxWidth = overlaySettings.contentMaxWidth;
  const contentHeight = overlaySettings.contentHeight;
  const fontOpacity = Math.max(0.1, Math.min(1, overlaySettings.fontOpacity));
  // const bgRgb = hexToRgb(overlaySettings.backgroundColor) ?? { r: 0, g: 0, b: 0 };
  // const bgAlpha = Math.max(0, Math.min(1, overlaySettings.backgroundOpacity));
  // const panelBg = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${bgAlpha})`;
  const fgRgb = hexToRgb(overlaySettings.fontColor) ?? { r: 255, g: 255, b: 255 };
  const fg = (alpha: number) =>
    `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, ${Math.max(0, Math.min(1, alpha)) * fontOpacity})`;
  const visibleLines = Math.max(1, Math.min(7, Math.round(overlaySettings.visibleLines || 3)));
  const aboveCount = Math.floor((visibleLines - 1) / 2);
  const belowCount = Math.max(0, visibleLines - 1 - aboveCount);
  const lineFade = (distance: number) => Math.max(0.25, 0.6 - distance * 0.12);
  // const aboveLines = Array.from({ length: aboveCount }, (_, i) => {
  //   const line = lines[activeIndex - (aboveCount - i)];
  //   return { text: line?.text ?? " ", distance: aboveCount - i };
  // });
  const belowLines = Array.from({ length: belowCount }, (_, i) => {
    const line = lines[activeIndex + i + 1];
    return { text: line?.text ?? " ", distance: i + 1 };
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent select-none" style={{ opacity }}>
      <div
        className="window-drag group relative m-0 flex flex-col rounded-none border-0 shadow-none"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="window-no-drag flex items-center rounded-sm group-hover:opacity-100">
          <button
            type="button"
            className="window-no-drag rounded-sm bg-black/30 px-2 py-1 text-xs text-white/70 opacity-0 group-hover:opacity-100"
            onClick={() => updateOffset(lyricsOffsetSeconds - 0.5)}
            title="歌词快退 0.5s（←）"
          >
            -0.5s
          </button>
          <button
            type="button"
            className="window-no-drag rounded-sm bg-black/30 px-2 py-1 text-xs text-white/70 opacity-0 group-hover:opacity-100"
            onClick={() => updateOffset(lyricsOffsetSeconds + 0.5)}
            title="歌词快进 0.5s（→）"
          >
            +0.5s
          </button>
          <button
            type="button"
            className="window-no-drag rounded-sm bg-black/30 px-2 py-1 text-xs text-white/70 opacity-0 group-hover:opacity-100"
            onClick={() => updateOffset(0)}
            title="重置偏移（Esc）"
          >
            重置
          </button>
          <button
            type="button"
            className="window-no-drag top-2 right-2 rounded-sm bg-black/30 px-2 py-1 text-xs text-white/70 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => window.electron.openLyricsOverlaySettings()}
            title="设置"
          >
            设置
          </button>
          <div
            className="rounded-sm bg-black/30 text-center text-white/50 opacity-0 group-hover:opacity-100"
            style={{ fontSize: 12 }}
          >
            {/* （只影响歌词，不影响音频） */}
            歌词偏移：{lyricsOffsetSeconds.toFixed(1)}s
          </div>
        </div>
        {/*<div className="px-4 pt-3 pb-2">*/}
        {/*  <div className="text-center text-sm" style={{ color: fg(0.9) }}>*/}
        {/*    {headerTitle}*/}
        {/*    {headerArtist ? <span style={{ color: fg(0.6) }}> · {headerArtist}</span> : null}*/}
        {/*    {!playerState.isPlaying && playerState.title ? (*/}
        {/*      <span className="ml-2" style={{ color: fg(0.5) }}>*/}
        {/*        (暂停)*/}
        {/*      </span>*/}
        {/*    ) : null}*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div className="window-drag inline-flex overflow-hidden">
          {status === "loading" && (
            <div className="text-center" style={{ color: fg(0.7) }}>
              正在获取歌词…
            </div>
          )}
          {status === "error" && (
            <div className="text-center" style={{ color: fg(0.7) }}>
              {error || "歌词获取失败"}
            </div>
          )}
          {status !== "loading" && status !== "error" && lines.length === 0 && (
            <div className="text-center" style={{ color: fg(0.7) }}>
              暂无歌词（可能未匹配到或该歌词无时间戳）
            </div>
          )}

          {lines.length > 0 && (
            <div className="flex items-center justify-center">
              <div
                className="w-full"
                style={{
                  maxWidth: Math.max(320, contentMaxWidth || 980),
                  height: Math.max(60, contentHeight || 120),
                }}
              >
                <div className="flex flex-col justify-center">
                  {/*{aboveLines.map((line, idx) => (*/}
                  {/*  <div*/}
                  {/*    key={`above-${activeIndex}-${idx}`}*/}
                  {/*    className="text-center"*/}
                  {/*    style={{ fontSize: Math.max(12, fontSize - 4), color: fg(lineFade(line.distance)) }}*/}
                  {/*  >*/}
                  {/*    {line.text}*/}
                  {/*  </div>*/}
                  {/*))}*/}

                  <div
                    ref={tokenContainerRef}
                    className="mt-2 mb-2 overflow-x-auto px-2 whitespace-nowrap"
                    style={{ fontSize }}
                  >
                    {tokens.length === 0 ? (
                      <span style={{ color: fg(0.85) }}>{activeLine?.text || "…"}</span>
                    ) : (
                      tokens.map((t, i) => {
                        const isActive = i === activeTokenIndex;
                        const isDone = i < activeTokenIndex;
                        return (
                          <span
                            key={`${activeLine?.time ?? 0}-${i}`}
                            ref={el => {
                              if (isActive) activeTokenElRef.current = el;
                            }}
                            className={clx("inline-block px-1 leading-8 transition-colors", {
                              "font-semibold": isActive,
                            })}
                            style={{ color: isActive ? fg(1) : isDone ? fg(0.9) : fg(0.55) }}
                          >
                            {t}
                          </span>
                        );
                      })
                    )}
                  </div>

                  {belowLines.map((line, idx) => (
                    <div
                      key={`below-${activeIndex}-${idx}`}
                      className="text-center"
                      style={{ fontSize: Math.max(12, fontSize - 4), color: fg(lineFade(line.distance)) }}
                    >
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
