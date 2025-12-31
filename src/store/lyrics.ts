import { create } from "zustand";

import type { LrcLine } from "@/common/utils/lrc";

import { parseLrc } from "@/common/utils/lrc";

type LyricsStatus = "idle" | "loading" | "ready" | "error";

type LyricsState = {
  status: LyricsStatus;
  title?: string;
  artist?: string;
  raw?: string;
  lines: LrcLine[];
  error?: string;
};

type LyricsActions = {
  reset: () => void;
  setLoading: (meta: { title?: string; artist?: string }) => void;
  setLyrics: (meta: { title?: string; artist?: string; raw?: string | null }) => void;
  setError: (meta: { title?: string; artist?: string; error: string }) => void;
};

const initialState: LyricsState = {
  status: "idle",
  lines: [],
};

export const useLyrics = create<LyricsState & LyricsActions>(set => ({
  ...initialState,
  reset: () => set(initialState),
  setLoading: ({ title, artist }) =>
    set({
      status: "loading",
      title,
      artist,
      raw: undefined,
      lines: [],
      error: undefined,
    }),
  setLyrics: ({ title, artist, raw }) =>
    set({
      status: "ready",
      title,
      artist,
      raw: raw ?? undefined,
      lines: parseLrc(raw),
      error: undefined,
    }),
  setError: ({ title, artist, error }) =>
    set({
      status: "error",
      title,
      artist,
      raw: undefined,
      lines: [],
      error,
    }),
}));
