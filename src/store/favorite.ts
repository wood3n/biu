import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getFavFolderCollectedList } from "@/service/fav-folder-collected-list";
import { getFavFolderCreatedList } from "@/service/fav-folder-created-list";
import { getSpaceNavnum } from "@/service/space-navnum";
import { useBBPPlaylistStore } from "@/store/bbp-playlist";
import { useBBPTokenStore } from "@/store/bbp-token";

export interface FavoriteItem {
  id: number;
  bbpId?: string;
  title: string;
  cover?: string;
  type?: number;
  mid?: number;
  source: "bilibili" | "bbplayer";
  role?: "owner" | "editor" | "subscriber";
}

interface State {
  createdFavorites: FavoriteItem[];
  collectedFavorites: FavoriteItem[];
  createdOrder: string[];
  collectedOrder: string[];
  lastFetchAt: number;
  lastFetchUserMid: string;
}

interface Action {
  updateCreatedFavorites: (userMid: number | string) => Promise<void>;
  addCreatedFavorite: (favorite: FavoriteItem) => void;
  rmCreatedFavorite: (key: string) => void;
  modifyCreatedFavorite: (favorite: Partial<FavoriteItem> & { id: number; bbpId?: string }) => void;
  reorderCreatedFavorites: (activeKey: string, overKey: string) => void;
  updateCollectedFavorites: (userMid: number | string) => Promise<void>;
  addCollectedFavorite: (favorite: FavoriteItem) => void;
  rmCollectedFavorite: (key: string) => void;
  reorderCollectedFavorites: (activeKey: string, overKey: string) => void;
  fetchFavoritesIfStale: (userMid: number | string, maxAgeMs?: number) => Promise<void>;
}

export const getItemKey = (item: { id: number; bbpId?: string }): string =>
  item.bbpId ? `bbp:${item.bbpId}` : `bili:${item.id}`;

const applySavedOrder = <T extends { id: number; bbpId?: string }>(list: T[], order: string[]) => {
  if (!order.length) {
    return list;
  }

  const orderSet = new Set(order);
  const ordered = order
    .map(key => list.find(item => getItemKey(item) === key))
    .filter((item): item is T => Boolean(item));
  const rest = list.filter(item => !orderSet.has(getItemKey(item)));

  return [...ordered, ...rest];
};

const reorderList = <T extends { id: number; bbpId?: string }>(list: T[], activeKey: string, overKey: string) => {
  const from = list.findIndex(item => getItemKey(item) === activeKey);
  const to = list.findIndex(item => getItemKey(item) === overKey);

  if (from < 0 || to < 0 || from === to) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  return next;
};

export const useFavoritesStore = create<State & Action>()(
  persist(
    (set, get) => ({
      createdFavorites: [],
      collectedFavorites: [],
      createdOrder: [],
      collectedOrder: [],
      lastFetchAt: 0,
      lastFetchUserMid: "",
      updateCreatedFavorites: async (userMid: number | string) => {
        const bilibiliPromise = userMid ? getAllCreatedFavorites(userMid) : Promise.resolve([] as FavoriteItem[]);
        const bbpPromise = getBBPFavorites();

        const [bilibiliFavorites, bbp] = await Promise.all([bilibiliPromise, bbpPromise]);

        const combined = [...bilibiliFavorites, ...bbp.created];
        const ordered = applySavedOrder(combined, get().createdOrder);

        set(() => ({
          createdFavorites: ordered,
          createdOrder: ordered.map(item => getItemKey(item)),
          lastFetchAt: Date.now(),
        }));
      },
      addCreatedFavorite: (favorite: FavoriteItem) =>
        set(state => {
          const next = [favorite, ...state.createdFavorites];

          return {
            createdFavorites: next,
            createdOrder: next.map(item => getItemKey(item)),
          };
        }),
      rmCreatedFavorite: (key: string) =>
        set(state => {
          const next = state.createdFavorites.filter(item => getItemKey(item) !== key);

          return {
            createdFavorites: next,
            createdOrder: next.map(item => getItemKey(item)),
          };
        }),
      modifyCreatedFavorite: (favorite: Partial<FavoriteItem> & { id: number; bbpId?: string }) =>
        set(state => ({
          createdFavorites: state.createdFavorites.map(item =>
            getItemKey(item) === getItemKey(favorite)
              ? {
                  ...item,
                  ...favorite,
                }
              : item,
          ),
        })),
      reorderCreatedFavorites: (activeKey: string, overKey: string) =>
        set(state => {
          const next = reorderList(state.createdFavorites, activeKey, overKey);

          if (next === state.createdFavorites) {
            return state;
          }

          return {
            createdFavorites: next,
            createdOrder: next.map(item => getItemKey(item)),
          };
        }),
      updateCollectedFavorites: async (userMid: number | string) => {
        const bilibiliPromise = userMid ? getAllCollectedFavorites(userMid) : Promise.resolve([] as FavoriteItem[]);
        const bbpPromise = getBBPFavorites();

        const [bilibiliFavorites, bbp] = await Promise.all([bilibiliPromise, bbpPromise]);

        const combined = [...bilibiliFavorites, ...bbp.collected];
        const ordered = applySavedOrder(combined, get().collectedOrder);

        set(() => ({
          collectedFavorites: ordered,
          collectedOrder: ordered.map(item => getItemKey(item)),
          lastFetchAt: Date.now(),
        }));
      },
      addCollectedFavorite: (favorite: FavoriteItem) =>
        set(state => {
          const next = [favorite, ...state.collectedFavorites];

          return {
            collectedFavorites: next,
            collectedOrder: next.map(item => getItemKey(item)),
          };
        }),
      rmCollectedFavorite: (key: string) =>
        set(state => {
          const next = state.collectedFavorites.filter(item => getItemKey(item) !== key);

          return {
            collectedFavorites: next,
            collectedOrder: next.map(item => getItemKey(item)),
          };
        }),
      reorderCollectedFavorites: (activeKey: string, overKey: string) =>
        set(state => {
          const next = reorderList(state.collectedFavorites, activeKey, overKey);

          if (next === state.collectedFavorites) {
            return state;
          }

          return {
            collectedFavorites: next,
            collectedOrder: next.map(item => getItemKey(item)),
          };
        }),
      fetchFavoritesIfStale: async (userMid: number | string, maxAgeMs = 5 * 60 * 1000) => {
        const { lastFetchAt, lastFetchUserMid, createdFavorites, collectedFavorites } = get();
        const midKey = String(userMid);
        const hasData = createdFavorites.length > 0 || collectedFavorites.length > 0;
        const midChanged = midKey !== lastFetchUserMid;
        if (hasData && !midChanged && Date.now() - lastFetchAt < maxAgeMs) {
          return;
        }
        set(() => ({ lastFetchAt: Date.now(), lastFetchUserMid: midKey }));
        await Promise.all([get().updateCreatedFavorites(userMid), get().updateCollectedFavorites(userMid)]);
      },
    }),
    {
      name: "favorites-cache",
      partialize: state => ({
        createdOrder: state.createdOrder,
        collectedOrder: state.collectedOrder,
      }),
    },
  ),
);

async function getAllCreatedFavorites(userMid: number | string) {
  const res = await getSpaceNavnum({
    mid: userMid,
  });

  if (res.code !== 0) {
    return [];
  }

  const total = res.data?.favourite?.master ?? 0;

  if (!total) {
    return [];
  }

  const pageSize = 50;
  const totalPages = Math.ceil(total / pageSize);

  const requests = Array.from({ length: totalPages }, (_, index) =>
    getFavFolderCreatedList({
      up_mid: userMid,
      ps: pageSize,
      pn: index + 1,
    }),
  );

  const favorites: FavoriteItem[] = [];

  const results = await Promise.allSettled(requests);

  results.forEach(result => {
    if (result.status !== "fulfilled") {
      return;
    }

    const response = result.value;

    if (response.code !== 0 || !response.data?.list?.length) {
      return;
    }

    response.data.list.forEach(item => {
      if (item.state === 0) {
        favorites.push({
          id: item.id,
          title: item.title,
          cover: item.cover,
          type: item.type,
          mid: item.mid,
          source: "bilibili" as const,
        });
      }
    });
  });

  return favorites;
}

async function getAllCollectedFavorites(userMid: number | string) {
  const pageSize = 50;

  const firstRes = await getFavFolderCollectedList({
    up_mid: userMid,
    ps: pageSize,
    pn: 1,
    platform: "web",
  });

  if (firstRes.code !== 0 || !firstRes.data) {
    return [];
  }

  const favorites: FavoriteItem[] = [];

  if (firstRes.data.list?.length) {
    firstRes.data.list.forEach(item => {
      if (item.state === 0) {
        favorites.push({
          id: item.id,
          title: item.title,
          cover: item.cover,
          type: item.type,
          mid: item.mid,
          source: "bilibili" as const,
        });
      }
    });
  }

  const total = firstRes.data.count ?? favorites.length;
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) {
    return favorites;
  }

  const requests = Array.from({ length: totalPages - 1 }, (_, index) =>
    getFavFolderCollectedList({
      up_mid: userMid,
      ps: pageSize,
      pn: index + 2,
      platform: "web",
    }),
  );

  const results = await Promise.allSettled(requests);

  results.forEach(result => {
    if (result.status !== "fulfilled") {
      return;
    }

    const response = result.value;

    if (response.code !== 0 || !response.data?.list?.length) {
      return;
    }

    response.data.list.forEach(item => {
      if (item.state === 0) {
        favorites.push({
          id: item.id,
          title: item.title,
          cover: item.cover,
          type: item.type,
          mid: item.mid,
          source: "bilibili" as const,
        });
      }
    });
  });

  return favorites;
}

async function getBBPFavorites() {
  const { token } = useBBPTokenStore.getState();
  if (!token) {
    return { created: [] as FavoriteItem[], collected: [] as FavoriteItem[] };
  }

  await useBBPPlaylistStore.getState().fetchPlaylistsIfStale();

  const { playlists } = useBBPPlaylistStore.getState();

  const created: FavoriteItem[] = [];
  const collected: FavoriteItem[] = [];

  playlists.forEach(playlist => {
    const item: FavoriteItem = {
      id: 0,
      bbpId: playlist.id,
      title: playlist.title,
      cover: playlist.coverUrl ?? undefined,
      source: "bbplayer" as const,
      role: playlist.role,
    };

    if (playlist.role === "owner") {
      created.push(item);
    } else {
      collected.push(item);
    }
  });

  return { created, collected };
}
