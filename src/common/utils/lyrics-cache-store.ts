export type LyricsCacheEntry = {
  provider: string;
  raw: string;
  fetchedAt: number;
  title?: string;
  artist?: string;
};

export type LyricsTitleMapEntry = {
  title?: string;
  artist?: string;
};

export type LyricsCacheStore = {
  titles: Record<string, LyricsTitleMapEntry | string>;
  lyrics: Record<string, LyricsCacheEntry>;
  offsets: Record<string, number>;
};

let store: LyricsCacheStore = { titles: {}, lyrics: {}, offsets: {} };
let loadPromise: Promise<void> | null = null;

function isLyricsEntry(value: unknown): value is LyricsCacheEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as LyricsCacheEntry;
  return typeof entry.provider === "string" && typeof entry.raw === "string" && typeof entry.fetchedAt === "number";
}

function normalizeStore(input?: Partial<LyricsCacheStore>) {
  if (!input || typeof input !== "object") {
    return { titles: {}, lyrics: {}, offsets: {} };
  }

  const hasSections = "titles" in input || "lyrics" in input || "offsets" in input;
  if (hasSections) {
    const titles = input.titles && typeof input.titles === "object" ? input.titles : {};
    let lyrics = input.lyrics && typeof input.lyrics === "object" ? input.lyrics : {};
    const offsets = input.offsets && typeof input.offsets === "object" ? input.offsets : {};
    if (Object.keys(lyrics).length === 0) {
      const legacyLyrics: Record<string, LyricsCacheEntry> = {};
      for (const [key, value] of Object.entries(input)) {
        if (key === "titles" || key === "lyrics" || key === "offsets") continue;
        if (isLyricsEntry(value)) legacyLyrics[key] = value;
      }
      if (Object.keys(legacyLyrics).length > 0) {
        lyrics = legacyLyrics;
      }
    }
    return { titles, lyrics, offsets };
  }

  // Backward-compat: older versions stored lyrics map directly in "lyrics-cache".
  const legacyLyrics: Record<string, LyricsCacheEntry> = {};
  for (const [key, value] of Object.entries(input)) {
    if (isLyricsEntry(value)) {
      legacyLyrics[key] = value;
    }
  }
  return { titles: {}, lyrics: legacyLyrics, offsets: {} };
}

async function ensureLoaded() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const data = await window.electron.getStore<LyricsCacheStore>("lyrics-cache");
      if (data && typeof data === "object") {
        store = normalizeStore(data);
      }
    } catch {
      // ignore storage read failures
    }
  })();
  return loadPromise;
}

async function persist() {
  await window.electron.setStore("lyrics-cache", store);
}

export async function getLyricsCacheStoreSnapshot() {
  await ensureLoaded();
  return store;
}

export async function updateLyricsCacheStore(mutator: (draft: LyricsCacheStore) => void) {
  await ensureLoaded();
  mutator(store);
  await persist();
}

export async function clearLyricsCacheStore() {
  store = { titles: {}, lyrics: {}, offsets: {} };
  await window.electron.setStore("lyrics-cache", store);
}
