import { useCallback, useEffect, useRef } from "react";

import { shallow } from "zustand/shallow";

import { createLyricsBroadcastChannel } from "@/common/broadcast/lyrics-overlay-sync";
import { getCachedLyrics, setCachedLyrics } from "@/common/utils/lyrics-cache";
import { getCachedLyricsOffset, setCachedLyricsOffset } from "@/common/utils/lyrics-offset-cache";
import { getLyricsTitleMapEntry, reloadLyricsTitleMap, setLyricsTitleMapEntry } from "@/common/utils/lyrics-title-map";
import { useLyrics } from "@/store/lyrics";
import { usePlayList } from "@/store/play-list";
import { usePlayProgress } from "@/store/play-progress";
import { useSettings } from "@/store/settings";

type LyricsOverlayMessage =
  | {
      from: "overlay";
      data:
        | { type: "init" }
        | { type: "settings:update"; patch: Partial<AppSettings> }
        | { type: "offset:update"; mediaKey: string; offsetSeconds: number }
        | { type: "lyrics:refresh" }
        | { type: "lyrics:manual-update"; title?: string; artist?: string };
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
          }
        | {
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

function extractLyricsText(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const pickFromObject = (obj: any) => {
    if (!obj || typeof obj !== "object") return undefined;
    const candidates = [
      obj?.syncedLyrics,
      obj?.lrc,
      obj?.lyrics,
      obj?.lyric,
      obj?.data?.syncedLyrics,
      obj?.data?.lrc,
      obj?.data?.lyrics,
      obj?.data?.lyric,
    ];
    return candidates.find(v => typeof v === "string" && v.trim().length > 0) as string | undefined;
  };

  // Allow providers to return JSON. We try a few common keys.
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json: any = JSON.parse(trimmed);
      const direct = pickFromObject(json);
      if (direct) return direct;

      if (Array.isArray(json)) {
        for (const item of json) {
          const hit = pickFromObject(item);
          if (hit) return hit;
        }
      }

      if (Array.isArray(json?.data)) {
        for (const item of json.data) {
          const hit = pickFromObject(item);
          if (hit) return hit;
        }
      }
    } catch {
      // Fall through to plain text.
    }
  }

  return raw;
}

export function LyricsOverlayBridge() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const lastFetchedKeyRef = useRef<string | undefined>(undefined);
  const inFlightRef = useRef<Set<string>>(new Set());
  const lastMetaKeyRef = useRef<string | undefined>(undefined);
  const currentMediaKeyRef = useRef<string | undefined>(undefined);
  const resolvedTitleRef = useRef<string | undefined>(undefined);
  const resolvedArtistRef = useRef<string | undefined>(undefined);
  const currentOffsetRef = useRef(0);
  const fetchLyricsForStateRef = useRef<
    (
      state: ReturnType<typeof usePlayList.getState>,
      options?: { force?: boolean; skipCache?: boolean },
    ) => Promise<void>
  >(() => Promise.resolve());

  const lyricsOverlayEnabled = useSettings(s => s.lyricsOverlayEnabled);
  const lyricsOverlayAutoShow = useSettings(s => s.lyricsOverlayAutoShow);
  const lyricsProvider = useSettings(s => s.lyricsProvider);
  const neteaseSearchUrlTemplate = useSettings(s => s.neteaseSearchUrlTemplate);
  const neteaseLyricUrlTemplate = useSettings(s => s.neteaseLyricUrlTemplate);
  const lyricsTitleResolverEnabled = useSettings(s => s.lyricsTitleResolverEnabled);
  const lyricsTitleResolverProvider = useSettings(s => s.lyricsTitleResolverProvider);
  const lyricsTitleResolverUrlTemplate = useSettings(s => s.lyricsTitleResolverUrlTemplate);
  const lyricsApiUrlTemplate = useSettings(s => s.lyricsApiUrlTemplate);

  const buildMediaKey = (item: ReturnType<ReturnType<typeof usePlayList.getState>["getPlayItem"]>) => {
    if (!item) return undefined;
    if (item.type === "audio" && item.sid) return `audio:${item.sid}`;
    if (item.type === "mv" && item.bvid) return `mv:${item.bvid}:${item.cid ?? ""}`;
    return `play:${item.id}`;
  };

  useEffect(() => {
    if (!lyricsOverlayEnabled) {
      bcRef.current?.close();
      bcRef.current = null;

      window.electron.isLyricsOverlayOpen().then(isOpen => {
        if (isOpen) {
          window.electron.closeLyricsOverlay();
        }
      });

      return;
    }

    bcRef.current = createLyricsBroadcastChannel();

    const postLyricsMeta = (meta: {
      title?: string;
      artist?: string;
      resolvedTitle?: string;
      resolvedArtist?: string;
      mappedTitle?: string;
      mappedArtist?: string;
    }) => {
      bcRef.current?.postMessage({
        from: "main",
        data: {
          type: "meta",
          meta,
        },
        ts: Date.now(),
      } satisfies LyricsOverlayMessage);
    };

    bcRef.current.onmessage = ev => {
      console.log("bcRef::::::", JSON.stringify(ev.data));
      const msg = ev.data as LyricsOverlayMessage;
      if (!msg || msg.from !== "overlay") return;

      if (msg.data?.type === "settings:update") {
        const patch = (msg.data as any)?.patch as Partial<AppSettings> | undefined;
        if (!patch || typeof patch !== "object") return;
        // 只允许 overlay 更新与 overlay 本身展示相关的字段
        const safePatch: Partial<AppSettings> = {};
        if (typeof patch.lyricsOverlayFontSize === "number")
          safePatch.lyricsOverlayFontSize = patch.lyricsOverlayFontSize;
        if (typeof patch.lyricsOverlayOpacity === "number") safePatch.lyricsOverlayOpacity = patch.lyricsOverlayOpacity;
        if (typeof patch.lyricsOverlayContentMaxWidth === "number")
          safePatch.lyricsOverlayContentMaxWidth = patch.lyricsOverlayContentMaxWidth;
        if (typeof patch.lyricsOverlayContentHeight === "number")
          safePatch.lyricsOverlayContentHeight = patch.lyricsOverlayContentHeight;
        if (typeof patch.lyricsOverlayWindowWidth === "number")
          safePatch.lyricsOverlayWindowWidth = patch.lyricsOverlayWindowWidth;
        if (typeof patch.lyricsOverlayWindowHeight === "number")
          safePatch.lyricsOverlayWindowHeight = patch.lyricsOverlayWindowHeight;
        if (typeof patch.lyricsOverlayBackgroundColor === "string")
          safePatch.lyricsOverlayBackgroundColor = patch.lyricsOverlayBackgroundColor;
        if (typeof patch.lyricsOverlayBackgroundOpacity === "number")
          safePatch.lyricsOverlayBackgroundOpacity = patch.lyricsOverlayBackgroundOpacity;
        if (typeof patch.lyricsOverlayFontColor === "string")
          safePatch.lyricsOverlayFontColor = patch.lyricsOverlayFontColor;
        if (typeof patch.lyricsOverlayFontOpacity === "number")
          safePatch.lyricsOverlayFontOpacity = patch.lyricsOverlayFontOpacity;
        if (typeof patch.lyricsOverlayVisibleLines === "number")
          safePatch.lyricsOverlayVisibleLines = patch.lyricsOverlayVisibleLines;
        if (typeof patch.lyricsOverlayPanelX === "number") safePatch.lyricsOverlayPanelX = patch.lyricsOverlayPanelX;
        if (typeof patch.lyricsOverlayPanelY === "number") safePatch.lyricsOverlayPanelY = patch.lyricsOverlayPanelY;

        if (Object.keys(safePatch).length > 0) {
          useSettings.getState().update(safePatch);
        }
        return;
      }

      if (msg.data?.type === "lyrics:manual-update") {
        const mediaKey = currentMediaKeyRef.current;
        if (!mediaKey) return;
        void (async () => {
          const current = await getLyricsTitleMapEntry(mediaKey);
          const nextTitle = current?.title;
          const nextArtist = current?.artist;
          await setLyricsTitleMapEntry(mediaKey, { title: nextTitle, artist: nextArtist });
          await fetchLyricsForStateRef.current(usePlayList.getState(), { force: true, skipCache: true });
        })();
        return;
      }

      if (msg.data?.type === "lyrics:refresh") {
        void fetchLyricsForStateRef.current(usePlayList.getState(), { force: true, skipCache: true });
        return;
      }

      if (msg.data?.type === "offset:update") {
        const mediaKey = (msg.data as any)?.mediaKey;
        const offsetSeconds = (msg.data as any)?.offsetSeconds;
        if (typeof mediaKey !== "string" || !mediaKey) return;
        if (typeof offsetSeconds !== "number" || Number.isNaN(offsetSeconds)) return;
        const clamped = Math.max(-600, Math.min(600, Math.round(offsetSeconds * 100) / 100));
        currentOffsetRef.current = clamped;
        void setCachedLyricsOffset(mediaKey, clamped);
        return;
      }

      if (msg.data?.type !== "init") return;
      console.log("meta:::::init");
      void (async () => {
        console.log("meta:::::111111");
        await reloadLyricsTitleMap();
        const play = usePlayList.getState();
        const playItem = play.getPlayItem();
        const mediaKey = buildMediaKey(playItem);
        const offsetSeconds = mediaKey ? await getCachedLyricsOffset(mediaKey) : 0;
        currentOffsetRef.current = offsetSeconds;
        const fallbackTitle = playItem?.pageTitle || playItem?.title;
        const fallbackArtist = playItem?.ownerName;
        const baseKey = mediaKey ?? play.playId;
        const mappedMeta = baseKey ? await getLyricsTitleMapEntry(baseKey) : null;
        currentMediaKeyRef.current = baseKey;
        if (!resolvedTitleRef.current) resolvedTitleRef.current = fallbackTitle;
        if (!resolvedArtistRef.current) resolvedArtistRef.current = fallbackArtist;
        const stateMsg: LyricsOverlayMessage = {
          from: "main",
          data: {
            type: "state",
            state: {
              mediaKey,
              title: fallbackTitle,
              artist: fallbackArtist,
              isPlaying: play.isPlaying,
              lyricsOffsetSeconds: offsetSeconds,
            },
          },
          ts: Date.now(),
        };
        bcRef.current?.postMessage(stateMsg);

        const lyrics = useLyrics.getState();
        const lyricsMsg: LyricsOverlayMessage = {
          from: "main",
          data: {
            type: "lyrics",
            lyrics: {
              title: lyrics.title,
              artist: lyrics.artist,
              status: lyrics.status,
              raw: lyrics.raw,
              error: lyrics.error,
            },
          },
          ts: Date.now(),
        };
        bcRef.current?.postMessage(lyricsMsg);

        const s = useSettings.getState();
        bcRef.current?.postMessage({
          from: "main",
          data: {
            type: "settings",
            settings: {
              lyricsOverlayFontSize: s.lyricsOverlayFontSize,
              lyricsOverlayOpacity: s.lyricsOverlayOpacity,
              lyricsOverlayContentMaxWidth: s.lyricsOverlayContentMaxWidth,
              lyricsOverlayContentHeight: s.lyricsOverlayContentHeight,
              lyricsOverlayWindowWidth: s.lyricsOverlayWindowWidth,
              lyricsOverlayWindowHeight: s.lyricsOverlayWindowHeight,
              lyricsOverlayBackgroundColor: s.lyricsOverlayBackgroundColor,
              lyricsOverlayBackgroundOpacity: s.lyricsOverlayBackgroundOpacity,
              lyricsOverlayFontColor: s.lyricsOverlayFontColor,
              lyricsOverlayFontOpacity: s.lyricsOverlayFontOpacity,
              lyricsOverlayVisibleLines: s.lyricsOverlayVisibleLines,
              lyricsOverlayPanelX: s.lyricsOverlayPanelX,
              lyricsOverlayPanelY: s.lyricsOverlayPanelY,
            },
          },
          ts: Date.now(),
        } satisfies LyricsOverlayMessage);

        postLyricsMeta({
          title: fallbackTitle,
          artist: fallbackArtist,
          resolvedTitle: resolvedTitleRef.current ?? fallbackTitle,
          resolvedArtist: resolvedArtistRef.current ?? fallbackArtist,
          mappedTitle: mappedMeta?.title,
          mappedArtist: mappedMeta?.artist,
        });

        console.log("meta:::::", JSON.stringify(fallbackArtist));
      })();
    };

    return () => {
      bcRef.current?.close();
      bcRef.current = null;
    };
  }, [lyricsOverlayEnabled]);

  useEffect(() => {
    if (!lyricsOverlayEnabled) return;

    const unsubscribe = usePlayList.subscribe((state, prev) => {
      const prevKey = {
        playId: prev.playId,
        isPlaying: prev.isPlaying,
      };
      const nextKey = {
        playId: state.playId,
        isPlaying: state.isPlaying,
      };
      if (shallow(prevKey, nextKey)) return;

      void (async () => {
        const playItem = state.getPlayItem();
        const mediaKey = buildMediaKey(playItem);
        const offsetSeconds = mediaKey ? await getCachedLyricsOffset(mediaKey) : 0;
        currentOffsetRef.current = offsetSeconds;
        const fallbackTitle = playItem?.pageTitle || playItem?.title;
        const fallbackArtist = playItem?.ownerName;
        const baseKey = mediaKey ?? state.playId;
        const mappedMeta = baseKey ? await getLyricsTitleMapEntry(baseKey) : null;
        const metaKey = baseKey;
        currentMediaKeyRef.current = baseKey;
        if (metaKey && metaKey !== lastMetaKeyRef.current) {
          lastMetaKeyRef.current = metaKey;
          resolvedTitleRef.current = fallbackTitle;
          resolvedArtistRef.current = fallbackArtist;
          bcRef.current?.postMessage({
            from: "main",
            data: {
              type: "meta",
              meta: {
                title: fallbackTitle,
                artist: fallbackArtist,
                resolvedTitle: resolvedTitleRef.current ?? fallbackTitle,
                resolvedArtist: resolvedArtistRef.current ?? fallbackArtist,
                mappedTitle: mappedMeta?.title,
                mappedArtist: mappedMeta?.artist,
              },
            },
            ts: Date.now(),
          } satisfies LyricsOverlayMessage);
        }
        bcRef.current?.postMessage({
          from: "main",
          data: {
            type: "state",
            state: {
              mediaKey,
              title: fallbackTitle,
              artist: fallbackArtist,
              isPlaying: state.isPlaying,
              lyricsOffsetSeconds: offsetSeconds,
            },
          },
          ts: Date.now(),
        } satisfies LyricsOverlayMessage);
      })();
    });

    return () => unsubscribe();
  }, [lyricsOverlayEnabled]);

  useEffect(() => {
    if (!lyricsOverlayEnabled) return;

    const unsubscribe = usePlayProgress.subscribe((state, prev) => {
      if (state.currentTime === prev.currentTime) return;
      const play = usePlayList.getState();
      const playItem = play.getPlayItem();
      const mediaKey = buildMediaKey(playItem);
      const fallbackTitle = playItem?.pageTitle || playItem?.title;
      const fallbackArtist = playItem?.ownerName;
      bcRef.current?.postMessage({
        from: "main",
        data: {
          type: "state",
          state: {
            mediaKey,
            title: fallbackTitle,
            artist: fallbackArtist,
            isPlaying: play.isPlaying,
            currentTime: state.currentTime,
            lyricsOffsetSeconds: currentOffsetRef.current,
          },
        },
        ts: Date.now(),
      } satisfies LyricsOverlayMessage);
    });

    return () => unsubscribe();
  }, [lyricsOverlayEnabled]);

  useEffect(() => {
    if (!lyricsOverlayEnabled) return;

    const unsubscribe = useSettings.subscribe((state, prev) => {
      const prevKey = {
        lyricsOverlayFontSize: prev.lyricsOverlayFontSize,
        lyricsOverlayOpacity: prev.lyricsOverlayOpacity,
        lyricsOverlayContentMaxWidth: prev.lyricsOverlayContentMaxWidth,
        lyricsOverlayContentHeight: prev.lyricsOverlayContentHeight,
        lyricsOverlayWindowWidth: prev.lyricsOverlayWindowWidth,
        lyricsOverlayWindowHeight: prev.lyricsOverlayWindowHeight,
        lyricsOverlayBackgroundColor: prev.lyricsOverlayBackgroundColor,
        lyricsOverlayBackgroundOpacity: prev.lyricsOverlayBackgroundOpacity,
        lyricsOverlayFontColor: prev.lyricsOverlayFontColor,
        lyricsOverlayFontOpacity: prev.lyricsOverlayFontOpacity,
        lyricsOverlayVisibleLines: prev.lyricsOverlayVisibleLines,
        lyricsOverlayPanelX: prev.lyricsOverlayPanelX,
        lyricsOverlayPanelY: prev.lyricsOverlayPanelY,
      };
      const nextKey = {
        lyricsOverlayFontSize: state.lyricsOverlayFontSize,
        lyricsOverlayOpacity: state.lyricsOverlayOpacity,
        lyricsOverlayContentMaxWidth: state.lyricsOverlayContentMaxWidth,
        lyricsOverlayContentHeight: state.lyricsOverlayContentHeight,
        lyricsOverlayWindowWidth: state.lyricsOverlayWindowWidth,
        lyricsOverlayWindowHeight: state.lyricsOverlayWindowHeight,
        lyricsOverlayBackgroundColor: state.lyricsOverlayBackgroundColor,
        lyricsOverlayBackgroundOpacity: state.lyricsOverlayBackgroundOpacity,
        lyricsOverlayFontColor: state.lyricsOverlayFontColor,
        lyricsOverlayFontOpacity: state.lyricsOverlayFontOpacity,
        lyricsOverlayVisibleLines: state.lyricsOverlayVisibleLines,
        lyricsOverlayPanelX: state.lyricsOverlayPanelX,
        lyricsOverlayPanelY: state.lyricsOverlayPanelY,
      };
      if (shallow(prevKey, nextKey)) return;

      bcRef.current?.postMessage({
        from: "main",
        data: {
          type: "settings",
          settings: nextKey,
        },
        ts: Date.now(),
      } satisfies LyricsOverlayMessage);
    });

    return () => unsubscribe();
  }, [lyricsOverlayEnabled]);

  useEffect(() => {
    if (!lyricsOverlayEnabled || !lyricsOverlayAutoShow) return;

    const unsubscribe = usePlayList.subscribe((state, prev) => {
      if (!state.playId) return;
      if (prev.isPlaying || !state.isPlaying) return;

      window.electron.isLyricsOverlayOpen().then(isOpen => {
        if (!isOpen) {
          window.electron.openLyricsOverlay();
        }
      });
    });

    return () => unsubscribe();
  }, [lyricsOverlayEnabled, lyricsOverlayAutoShow]);

  useEffect(() => {
    if (!lyricsOverlayEnabled) return;

    const unsubscribe = useLyrics.subscribe((state, prev) => {
      const prevKey = { status: prev.status, raw: prev.raw, title: prev.title, artist: prev.artist };
      const nextKey = { status: state.status, raw: state.raw, title: state.title, artist: state.artist };
      if (shallow(prevKey, nextKey)) return;

      bcRef.current?.postMessage({
        from: "main",
        data: {
          type: "lyrics",
          lyrics: {
            title: state.title,
            artist: state.artist,
            status: state.status,
            raw: state.raw,
            error: state.error,
          },
        },
        ts: Date.now(),
      } satisfies LyricsOverlayMessage);
    });

    return () => unsubscribe();
  }, [lyricsOverlayEnabled]);

  const fetchLyricsForState = useCallback(
    async (state: ReturnType<typeof usePlayList.getState>, options?: { force?: boolean; skipCache?: boolean }) => {
      if (!state.playId) return;

      const playItem = state.getPlayItem();
      const title = playItem?.pageTitle || playItem?.title;
      const artist = playItem?.ownerName;
      const mediaKey = buildMediaKey(playItem);
      const baseKey = mediaKey ?? state.playId;
      const mappedMeta = baseKey ? await getLyricsTitleMapEntry(baseKey) : null;
      const mappedTitle = mappedMeta?.title?.trim();
      const mappedArtist = mappedMeta?.artist?.trim();
      const manualCacheKey = mappedTitle || mappedArtist ? `${mappedTitle || ""}::${mappedArtist || ""}` : "";
      const cacheKey = baseKey && manualCacheKey ? `${baseKey}::manual:${manualCacheKey}` : baseKey;
      const fetchKey = `${baseKey}::${lyricsProvider}::${mappedTitle || "auto"}::${mappedArtist || "auto"}`;

      if (!options?.force && lastFetchedKeyRef.current === fetchKey) return;
      if (inFlightRef.current.has(fetchKey)) return;

      const cached = options?.skipCache ? null : cacheKey ? await getCachedLyrics(cacheKey, lyricsProvider) : null;
      if (cached?.raw?.trim()) {
        useLyrics.getState().setLyrics({ title, artist, raw: cached.raw });
        lastFetchedKeyRef.current = fetchKey;
        return;
      }

      inFlightRef.current.add(fetchKey);

      if (lyricsOverlayAutoShow) {
        const isOpen = await window.electron.isLyricsOverlayOpen();
        if (!isOpen) {
          await window.electron.openLyricsOverlay();
        }
      }

      if (!title) {
        useLyrics.getState().reset();
        return;
      }

      // 注意：这是渲染进程日志，请在窗口 DevTools Console 查看。
      console.log("Fetching lyrics for:", { title, artist });

      try {
        let resolvedTitle = title;
        let resolvedArtist = artist;
        if (mappedTitle) resolvedTitle = mappedTitle;
        if (mappedArtist) resolvedArtist = mappedArtist;
        if (lyricsTitleResolverEnabled && !mappedTitle && !mappedArtist) {
          const cacheKey = baseKey;
          if (lyricsTitleResolverProvider === "ark") {
            const arkHit = await window.electron.resolveSongTitleArk({ cacheKey, title, artist });
            console.log("Resolved title arkHit:", arkHit);
            if (arkHit?.title?.trim()) resolvedTitle = arkHit.title.trim();
            if (arkHit?.artist?.trim()) resolvedArtist = arkHit.artist.trim();
          } else if (lyricsTitleResolverUrlTemplate?.trim()) {
            const hit = await window.electron.resolveSongTitle({
              cacheKey,
              urlTemplate: lyricsTitleResolverUrlTemplate,
              title,
              artist,
            });
            if (typeof hit === "string" && hit.trim()) resolvedTitle = hit.trim();
          }
          await setLyricsTitleMapEntry(baseKey, { title: resolvedTitle, artist: resolvedArtist });
        }
        if (mappedTitle || mappedArtist) {
          await setLyricsTitleMapEntry(baseKey, { title: resolvedTitle, artist: resolvedArtist });
        }

        resolvedTitleRef.current = resolvedTitle;
        resolvedArtistRef.current = resolvedArtist;
        bcRef.current?.postMessage({
          from: "main",
          data: {
            type: "meta",
            meta: {
              title,
              artist,
              resolvedTitle,
              resolvedArtist,
              mappedTitle: mappedTitle || resolvedTitle,
              mappedArtist: mappedArtist || resolvedArtist,
            },
          },
          ts: Date.now(),
        } satisfies LyricsOverlayMessage);

        useLyrics.getState().setLoading({ title, artist });
        if (lyricsProvider === "netease") {
          const lrc = await window.electron.searchLyricsNetease({
            title: resolvedTitle,
            artist: resolvedArtist,
            searchUrlTemplate: neteaseSearchUrlTemplate,
            lyricUrlTemplate: neteaseLyricUrlTemplate,
          });
          if (typeof lrc !== "string" || lrc.trim().length === 0) {
            useLyrics.getState().setError({ title, artist, error: "未找到歌词（网易云无结果）" });
            return;
          }
          useLyrics.getState().setLyrics({ title, artist, raw: lrc });
          if (cacheKey) {
            await setCachedLyrics(cacheKey, {
              provider: lyricsProvider,
              raw: lrc,
              fetchedAt: Date.now(),
              title,
              artist,
            });
          }
        } else {
          const urlTemplate = lyricsApiUrlTemplate?.trim();
          if (!urlTemplate) {
            useLyrics.getState().reset();
            return;
          }
          const raw = await window.electron.searchLyrics({ urlTemplate, title: resolvedTitle, artist: resolvedArtist });
          const text = raw ? extractLyricsText(raw) : "";
          if (!text.trim()) {
            useLyrics.getState().setError({ title, artist, error: "未找到歌词（自定义 API 返回为空）" });
            return;
          }
          useLyrics.getState().setLyrics({ title, artist, raw: text });
          if (cacheKey) {
            await setCachedLyrics(cacheKey, {
              provider: lyricsProvider,
              raw: text,
              fetchedAt: Date.now(),
              title,
              artist,
            });
          }
        }
        lastFetchedKeyRef.current = fetchKey;
      } catch (err: any) {
        useLyrics.getState().setError({ title, artist, error: err?.message || "歌词查询失败" });
      } finally {
        inFlightRef.current.delete(fetchKey);
      }
    },
    [
      lyricsOverlayAutoShow,
      lyricsProvider,
      neteaseSearchUrlTemplate,
      neteaseLyricUrlTemplate,
      lyricsTitleResolverEnabled,
      lyricsTitleResolverProvider,
      lyricsTitleResolverUrlTemplate,
      lyricsApiUrlTemplate,
    ],
  );

  useEffect(() => {
    fetchLyricsForStateRef.current = fetchLyricsForState;
  }, [fetchLyricsForState]);

  useEffect(() => {
    if (!lyricsOverlayEnabled) return;

    const unsubscribe = usePlayList.subscribe((state, prev) => {
      const playIdChanged = !!state.playId && state.playId !== prev.playId;
      const startedPlaying = !!state.playId && !prev.isPlaying && state.isPlaying;
      if (!playIdChanged && !startedPlaying) return;
      void fetchLyricsForState(state);
    });

    // 初次启用桌面歌词时，如果当前已有播放项，立即拉取一次（否则需要等“切歌”才触发）。
    void fetchLyricsForState(usePlayList.getState());

    return () => unsubscribe();
  }, [lyricsOverlayEnabled, fetchLyricsForState]);

  useEffect(() => {
    if (!lyricsOverlayEnabled) return;
    const state = usePlayList.getState();
    if (!state.playId) return;
    void fetchLyricsForState(state);
  }, [lyricsOverlayEnabled, fetchLyricsForState]);

  return null;
}
