import { create } from "zustand";

import type { FavMedia } from "@/service/fav-resource";

interface State {
  items: FavMedia[];
}

interface Action {
  setItems: (items: FavMedia[]) => void;
  appendItems: (items: FavMedia[]) => void;
  removeItem: (id: number) => void;
  clearItems: () => void;
}

export const useFavFolderItemsStore = create<State & Action>()(set => ({
  items: [],
  setItems: items => set({ items }),
  appendItems: items =>
    set(state => ({
      items: [...state.items, ...items],
    })),
  removeItem: id =>
    set(state => ({
      items: state.items.filter(item => item.id !== id),
    })),
  clearItems: () => set({ items: [] }),
}));

/** 收藏夹第一页内容缓存（localStorage） */
interface FavFolderCacheEntry {
  medias: FavMedia[];
  hasMore: boolean;
  cachedAt: number;
}

const CACHE_KEY = "fav-folder-items-cache";
const CACHE_MAX_ENTRIES = 200;

const readCache = (): Record<string, FavFolderCacheEntry> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FavFolderCacheEntry>) : {};
  } catch {
    return {};
  }
};

const writeCache = (cache: Record<string, FavFolderCacheEntry>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // 存储满/序列化失败时静默忽略，不影响主流程
  }
};

/** 读取收藏夹第一页缓存，无缓存返回 null */
export const getFavFolderCache = (mediaId: string): FavFolderCacheEntry | null => {
  if (!mediaId) return null;
  return readCache()[mediaId] ?? null;
};

/** 写入收藏夹第一页缓存（数量超限时淘汰最旧的条目） */
export const saveFavFolderCache = (mediaId: string, medias: FavMedia[], hasMore: boolean) => {
  if (!mediaId || !medias.length) return;
  const cache = readCache();
  cache[mediaId] = { medias, hasMore, cachedAt: Date.now() };

  const entries = Object.entries(cache).sort((a, b) => b[1].cachedAt - a[1].cachedAt);
  if (entries.length > CACHE_MAX_ENTRIES) {
    const trimmed = Object.fromEntries(entries.slice(0, CACHE_MAX_ENTRIES));
    writeCache(trimmed);
  } else {
    writeCache(cache);
  }
};
