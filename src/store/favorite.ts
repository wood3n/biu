import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getFavFolderCollectedList } from "@/service/fav-folder-collected-list";
import { getFavFolderCreatedList } from "@/service/fav-folder-created-list";
import { getSpaceNavnum } from "@/service/space-navnum";

export interface FavoriteItem {
  id: number;
  title: string;
  cover?: string;
  type?: number;
  mid?: number;
}

interface State {
  createdFavorites: FavoriteItem[];
  collectedFavorites: FavoriteItem[];
  createdOrder: number[];
  collectedOrder: number[];
}

interface Action {
  updateCreatedFavorites: (userMid: number | string) => Promise<void>;
  addCreatedFavorite: (favorite: FavoriteItem) => void;
  rmCreatedFavorite: (id: number) => void;
  modifyCreatedFavorite: (favorite: FavoriteItem) => void;
  reorderCreatedFavorites: (activeId: number, overId: number) => void;
  updateCollectedFavorites: (userMid: number | string) => Promise<void>;
  addCollectedFavorite: (favorite: FavoriteItem) => void;
  rmCollectedFavorite: (id: number) => void;
  reorderCollectedFavorites: (activeId: number, overId: number) => void;
}

const applySavedOrder = <T extends { id: number }>(list: T[], order: number[]) => {
  if (!order.length) {
    return list;
  }

  const orderSet = new Set(order);
  const ordered = order.map(id => list.find(item => item.id === id)).filter((item): item is T => Boolean(item));
  const rest = list.filter(item => !orderSet.has(item.id));

  return [...ordered, ...rest];
};

const reorderList = <T extends { id: number }>(list: T[], activeId: number, overId: number) => {
  const from = list.findIndex(item => item.id === activeId);
  const to = list.findIndex(item => item.id === overId);

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
      updateCreatedFavorites: async (userMid: number | string) => {
        const favorites = await getAllCreatedFavorites(userMid);
        const ordered = applySavedOrder(favorites, get().createdOrder);

        set(() => ({
          createdFavorites: ordered,
          createdOrder: ordered.map(item => item.id),
        }));
      },
      addCreatedFavorite: (favorite: FavoriteItem) =>
        set(state => {
          const next = [favorite, ...state.createdFavorites];

          return {
            createdFavorites: next,
            createdOrder: next.map(item => item.id),
          };
        }),
      rmCreatedFavorite: (id: number) =>
        set(state => {
          const next = state.createdFavorites.filter(item => item.id !== id);

          return {
            createdFavorites: next,
            createdOrder: next.map(item => item.id),
          };
        }),
      modifyCreatedFavorite: (favorite: FavoriteItem) =>
        set(state => ({
          createdFavorites: state.createdFavorites.map(item =>
            item.id === favorite.id
              ? {
                  ...item,
                  ...favorite,
                }
              : item,
          ),
        })),
      reorderCreatedFavorites: (activeId: number, overId: number) =>
        set(state => {
          const next = reorderList(state.createdFavorites, activeId, overId);

          if (next === state.createdFavorites) {
            return state;
          }

          return {
            createdFavorites: next,
            createdOrder: next.map(item => item.id),
          };
        }),
      updateCollectedFavorites: async (userMid: number | string) => {
        const favorites = await getAllCollectedFavorites(userMid);
        const ordered = applySavedOrder(favorites, get().collectedOrder);

        set(() => ({
          collectedFavorites: ordered,
          collectedOrder: ordered.map(item => item.id),
        }));
      },
      addCollectedFavorite: (favorite: FavoriteItem) =>
        set(state => {
          const next = [favorite, ...state.collectedFavorites];

          return {
            collectedFavorites: next,
            collectedOrder: next.map(item => item.id),
          };
        }),
      rmCollectedFavorite: (id: number) =>
        set(state => {
          const next = state.collectedFavorites.filter(item => item.id !== id);

          return {
            collectedFavorites: next,
            collectedOrder: next.map(item => item.id),
          };
        }),
      reorderCollectedFavorites: (activeId: number, overId: number) =>
        set(state => {
          const next = reorderList(state.collectedFavorites, activeId, overId);

          if (next === state.collectedFavorites) {
            return state;
          }

          return {
            collectedFavorites: next,
            collectedOrder: next.map(item => item.id),
          };
        }),
    }),
    {
      name: "favorites-order",
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
        });
      }
    });
  });

  return favorites;
}
