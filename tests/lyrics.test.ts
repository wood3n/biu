import { beforeEach, describe, expect, test, vi } from "vitest";

import type { PlayData } from "@/store/play-list";

import { getLyricsByBili } from "@/components/lyrics/get-lyrics";
import { getActiveLyricIndex, parseLrc, useLyricsStore } from "@/store/lyrics";
import { usePlayList } from "@/store/play-list";

vi.mock("@/components/lyrics/get-lyrics", () => ({
  getLyricsByBili: vi.fn(),
}));

const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

const createPlayItem = (overrides: Partial<PlayData> = {}): PlayData => ({
  id: "play-1",
  title: "test",
  type: "mv",
  bvid: "BV1xx",
  cid: "100",
  ...overrides,
});

const setPlayItem = (item: PlayData | undefined) => {
  usePlayList.setState({ getPlayItem: () => item });
};

const getElectronStoreMock = () => (window as any).electron.getStore as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  useLyricsStore.getState().reset();
  setPlayItem(undefined);
  (window as any).electron = {
    getStore: vi.fn().mockResolvedValue(undefined),
    setStore: vi.fn().mockResolvedValue(undefined),
  };
});

describe("parseLrc", () => {
  test("parses timestamped lines", () => {
    const result = parseLrc("[00:01.00]first\n[00:02.500]second\n");

    expect(result).toEqual([
      { time: 1000, text: "first" },
      { time: 2500, text: "second" },
    ]);
  });

  test("supports one line with multiple timestamps", () => {
    const result = parseLrc("[00:05.00][00:01.00]chorus\n");

    expect(result).toEqual([
      { time: 1000, text: "chorus" },
      { time: 5000, text: "chorus" },
    ]);
  });

  test("drops metadata, empty lines and empty text", () => {
    const result = parseLrc("[ti:title]\n[00:01.00]\n[00:02.00] kept \n");

    expect(result).toEqual([{ time: 2000, text: "kept" }]);
  });

  test("returns empty array for missing input", () => {
    expect(parseLrc()).toEqual([]);
    expect(parseLrc(undefined)).toEqual([]);
  });
});

describe("getActiveLyricIndex", () => {
  const lyrics = [
    { time: 1000, text: "a" },
    { time: 3000, text: "b" },
  ];

  test("returns -1 for empty lyrics or before first line", () => {
    expect(getActiveLyricIndex([], 0)).toBe(-1);
    expect(getActiveLyricIndex(lyrics, 500)).toBe(-1);
  });

  test("matches line boundaries", () => {
    expect(getActiveLyricIndex(lyrics, 1000)).toBe(0);
    expect(getActiveLyricIndex(lyrics, 2999)).toBe(0);
    expect(getActiveLyricIndex(lyrics, 3000)).toBe(1);
    expect(getActiveLyricIndex(lyrics, 99999)).toBe(1);
  });
});

describe("useLyricsStore", () => {
  test("uses cached lyrics without requesting the network", async () => {
    getElectronStoreMock().mockResolvedValue({
      "BV1xx-100": { lyrics: "[00:01.00]cached line" },
    });
    setPlayItem(createPlayItem());

    await useLyricsStore.getState().load();

    expect(getLyricsByBili).not.toHaveBeenCalled();
    expect(useLyricsStore.getState().lyrics).toEqual([{ time: 1000, text: "cached line" }]);
    expect(useLyricsStore.getState().isLoaded).toBe(true);
    expect(useLyricsStore.getState().isLoading).toBe(false);
  });

  test("falls back to bilibili lyrics when cache is empty", async () => {
    vi.mocked(getLyricsByBili).mockResolvedValue([{ time: 1000, text: "online line" }]);
    setPlayItem(createPlayItem());

    await useLyricsStore.getState().load();

    expect(getLyricsByBili).toHaveBeenCalledTimes(1);
    expect(getLyricsByBili).toHaveBeenCalledWith({ bvid: "BV1xx", cid: 100 });
    expect(useLyricsStore.getState().lyrics).toEqual([{ time: 1000, text: "online line" }]);
  });

  test("does not request lyrics for items without bvid/cid", async () => {
    setPlayItem(createPlayItem({ bvid: undefined, cid: undefined }));

    await useLyricsStore.getState().load();

    expect(getLyricsByBili).not.toHaveBeenCalled();
    expect(useLyricsStore.getState().lyrics).toEqual([]);
    expect(useLyricsStore.getState().isLoaded).toBe(true);
  });

  test("deduplicates concurrent loads for the same song", async () => {
    vi.mocked(getLyricsByBili).mockResolvedValue([{ time: 1000, text: "line" }]);
    setPlayItem(createPlayItem());

    await Promise.all([useLyricsStore.getState().load(), useLyricsStore.getState().load()]);

    expect(getLyricsByBili).toHaveBeenCalledTimes(1);
  });

  test("does not load the same song twice", async () => {
    vi.mocked(getLyricsByBili).mockResolvedValue([{ time: 1000, text: "line" }]);
    setPlayItem(createPlayItem());

    await useLyricsStore.getState().load();
    await useLyricsStore.getState().load();

    expect(getLyricsByBili).toHaveBeenCalledTimes(1);
  });

  test("discards stale response when switching songs quickly", async () => {
    let resolveFirst: (value: LyricLine[]) => void = () => {};
    vi.mocked(getLyricsByBili).mockImplementationOnce(
      () =>
        new Promise<LyricLine[]>(resolve => {
          resolveFirst = resolve;
        }),
    );
    setPlayItem(createPlayItem({ bvid: "BVfirst", cid: "1" }));
    const first = useLyricsStore.getState().load();
    await flushPromises();

    vi.mocked(getLyricsByBili).mockResolvedValueOnce([{ time: 0, text: "second song" }]);
    setPlayItem(createPlayItem({ bvid: "BVsecond", cid: "2" }));
    await useLyricsStore.getState().load();

    resolveFirst([{ time: 0, text: "first song" }]);
    await first;

    const state = useLyricsStore.getState();
    expect(state.cacheKey).toBe("BVsecond-2");
    expect(state.lyrics).toEqual([{ time: 0, text: "second song" }]);
  });

  test("applyLyrics updates both original and translated lyrics", () => {
    useLyricsStore.getState().applyLyrics("[00:01.00]hello", "[00:01.00]你好");

    const state = useLyricsStore.getState();
    expect(state.lyrics).toEqual([{ time: 1000, text: "hello" }]);
    expect(state.translatedLyrics).toEqual([{ time: 1000, text: "你好" }]);
    expect(state.isLoaded).toBe(true);
  });

  test("applies cached offset when loading lyrics", async () => {
    getElectronStoreMock().mockResolvedValue({
      "BV1xx-100": { lyrics: "[00:01.00]cached line", offset: 1200 },
    });
    setPlayItem(createPlayItem());

    await useLyricsStore.getState().load();

    expect(useLyricsStore.getState().offset).toBe(1200);
  });

  test("resets offset when loading another song without cached offset", async () => {
    getElectronStoreMock().mockResolvedValue({
      "BV1xx-100": { lyrics: "[00:01.00]first", offset: 800 },
    });
    setPlayItem(createPlayItem());
    await useLyricsStore.getState().load();
    expect(useLyricsStore.getState().offset).toBe(800);

    getElectronStoreMock().mockResolvedValue({ "BV2xx-200": { lyrics: "[00:01.00]second" } });
    setPlayItem(createPlayItem({ bvid: "BV2xx", cid: "200" }));
    await useLyricsStore.getState().load();

    expect(useLyricsStore.getState().offset).toBe(0);
  });

  test("updates offset through setOffset", () => {
    useLyricsStore.getState().setOffset(1500);

    expect(useLyricsStore.getState().offset).toBe(1500);
  });

  test("applyLyrics invalidates an in-flight load", async () => {
    let resolveLoad: (value: LyricLine[]) => void = () => {};
    vi.mocked(getLyricsByBili).mockImplementationOnce(
      () =>
        new Promise<LyricLine[]>(resolve => {
          resolveLoad = resolve;
        }),
    );
    setPlayItem(createPlayItem());
    const pending = useLyricsStore.getState().load();
    await flushPromises();

    useLyricsStore.getState().applyLyrics("[00:02.00]adopted", "[00:02.00]采用");
    resolveLoad([{ time: 0, text: "late network" }]);
    await pending;

    expect(useLyricsStore.getState().lyrics).toEqual([{ time: 2000, text: "adopted" }]);
  });

  test("switching to an item without lyrics invalidates an in-flight load", async () => {
    let resolveLoad: (value: LyricLine[]) => void = () => {};
    vi.mocked(getLyricsByBili).mockImplementationOnce(
      () =>
        new Promise<LyricLine[]>(resolve => {
          resolveLoad = resolve;
        }),
    );
    setPlayItem(createPlayItem());
    const pending = useLyricsStore.getState().load();
    await flushPromises();

    setPlayItem(createPlayItem({ bvid: undefined, cid: undefined }));
    await useLyricsStore.getState().load();

    resolveLoad([{ time: 0, text: "late network" }]);
    await pending;

    expect(useLyricsStore.getState().lyrics).toEqual([]);
  });

  test("restores cached offset even when lyrics come from the network", async () => {
    getElectronStoreMock().mockResolvedValue({
      "BV1xx-100": { offset: 900 },
    });
    vi.mocked(getLyricsByBili).mockResolvedValue([{ time: 1000, text: "online line" }]);
    setPlayItem(createPlayItem());

    await useLyricsStore.getState().load();

    expect(useLyricsStore.getState().offset).toBe(900);
    expect(useLyricsStore.getState().lyrics).toEqual([{ time: 1000, text: "online line" }]);
  });

  test("does not overwrite offset adjusted while loading", async () => {
    let resolveStore: (value: unknown) => void = () => {};
    (window as any).electron.getStore = vi.fn(
      () =>
        new Promise(resolve => {
          resolveStore = resolve;
        }),
    );
    setPlayItem(createPlayItem());
    const pending = useLyricsStore.getState().load();
    await flushPromises();

    useLyricsStore.getState().setOffset(2500);
    resolveStore({ "BV1xx-100": { lyrics: "[00:01.00]cached", offset: 800 } });
    await pending;

    expect(useLyricsStore.getState().offset).toBe(2500);
    expect(useLyricsStore.getState().lyrics).toEqual([{ time: 1000, text: "cached" }]);
  });
});
