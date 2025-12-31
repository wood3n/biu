import { getLyricsCacheStoreSnapshot, updateLyricsCacheStore } from "./lyrics-cache-store";

const MAX_ENTRIES = 500;
const cache = new Map<string, number>();
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
      for (const [key, value] of Object.entries(store.offsets)) {
        if (typeof value !== "number") continue;
        cache.set(key, value);
      }
      evictIfNeeded();
    } catch {
      // ignore storage read failures
    }
  })();
  return loadPromise;
}

export async function getCachedLyricsOffset(key: string) {
  await ensureLoaded();
  return cache.get(key) ?? 0;
}

export async function setCachedLyricsOffset(key: string, seconds: number) {
  await ensureLoaded();
  cache.delete(key);
  cache.set(key, seconds);
  evictIfNeeded();
  await updateLyricsCacheStore(draft => {
    const next: Record<string, number> = {};
    for (const [k, value] of cache.entries()) {
      next[k] = value;
    }
    draft.offsets = next;
  });
}

export async function clearLyricsOffsetCache() {
  cache.clear();
  await updateLyricsCacheStore(draft => {
    draft.offsets = {};
  });
}
