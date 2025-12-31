import { getLyricsCacheStoreSnapshot, updateLyricsCacheStore, type LyricsCacheEntry } from "./lyrics-cache-store";

const MAX_ENTRIES = 200;
const cache = new Map<string, LyricsCacheEntry>();
let loadPromise: Promise<void> | null = null;

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
      for (const [key, value] of Object.entries(store.lyrics)) {
        if (!value || typeof value !== "object") continue;
        if (typeof value.raw !== "string") continue;
        if (typeof value.provider !== "string") continue;
        if (typeof value.fetchedAt !== "number") continue;
        cache.set(key, value);
      }
      evictIfNeeded();
    } catch {
      // ignore storage read failures
    }
  })();
  return loadPromise;
}

export async function getCachedLyrics(key: string, provider: string) {
  await ensureLoaded();
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.provider !== provider) return null;
  return hit;
}

export async function setCachedLyrics(key: string, entry: LyricsCacheEntry) {
  await ensureLoaded();
  cache.delete(key);
  cache.set(key, entry);
  evictIfNeeded();
  await updateLyricsCacheStore(draft => {
    const next: Record<string, LyricsCacheEntry> = {};
    for (const [k, value] of cache.entries()) {
      next[k] = value;
    }
    draft.lyrics = next;
  });
}

export async function clearLyricsCache() {
  cache.clear();
  await updateLyricsCacheStore(draft => {
    draft.lyrics = {};
  });
}
