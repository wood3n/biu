import { getLyricsCacheStoreSnapshot, updateLyricsCacheStore, type LyricsTitleMapEntry } from "./lyrics-cache-store";

export type { LyricsTitleMapEntry } from "./lyrics-cache-store";

type StoredValue = LyricsTitleMapEntry | string;

const MAX_ENTRIES = 500;
const cache = new Map<string, LyricsTitleMapEntry>();
let loadPromise: Promise<void> | null = null;

function normalizeValue(value: StoredValue): LyricsTitleMapEntry | null {
  if (typeof value === "string") {
    const title = value.trim();
    return title ? { title } : null;
  }
  if (!value || typeof value !== "object") return null;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const artist = typeof value.artist === "string" ? value.artist.trim() : "";
  if (!title && !artist) return null;
  return { title: title || undefined, artist: artist || undefined };
}

function evictIfNeeded() {
  while (cache.size > MAX_ENTRIES) {
    const firstKey = cache.keys().next().value as string | undefined;
    if (!firstKey) return;
    cache.delete(firstKey);
  }
}

async function ensureLoaded() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const store = await getLyricsCacheStoreSnapshot();
      for (const [key, value] of Object.entries(store.titles)) {
        const normalized = normalizeValue(value);
        if (!normalized) continue;
        cache.set(key, normalized);
      }
      evictIfNeeded();
    } catch {
      // ignore storage read failures
    }
  })();
  return loadPromise;
}

export async function reloadLyricsTitleMap() {
  cache.clear();
  loadPromise = null;
  await ensureLoaded();
}

export async function getLyricsTitleMapEntry(key?: string) {
  if (!key) return null;
  await ensureLoaded();
  console.log("cache.get(key)::::", key, JSON.stringify(cache.get(key)));
  return cache.get(key) ?? null;
}

export async function setLyricsTitleMapEntry(key: string, entry: LyricsTitleMapEntry) {
  if (!key) return;
  await ensureLoaded();
  const title = entry.title?.trim();
  const artist = entry.artist?.trim();
  if (!title && !artist) {
    cache.delete(key);
  } else {
    cache.set(key, { title: title || undefined, artist: artist || undefined });
  }
  evictIfNeeded();
  await updateLyricsCacheStore(draft => {
    const next: Record<string, StoredValue> = {};
    for (const [k, value] of cache.entries()) {
      next[k] = value;
    }
    draft.titles = next;
  });
}

export async function clearLyricsTitleMap() {
  cache.clear();
  await updateLyricsCacheStore(draft => {
    draft.titles = {};
  });
}
