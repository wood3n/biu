import { create } from "zustand";

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
}

interface Action {
  updateCreatedFavorites: (userMid: number | string) => Promise<void>;
  addCreatedFavorite: (favorite: FavoriteItem) => void;
  rmCreatedFavorite: (id: number) => void;
  modifyCreatedFavorite: (favorite: FavoriteItem) => void;
  updateCollectedFavorites: (userMid: number | string) => Promise<void>;
  addCollectedFavorite: (favorite: FavoriteItem) => void;
  rmCollectedFavorite: (id: number) => void;
}

export const useFavoritesStore = create<State & Action>()(set => ({
  createdFavorites: [],
  collectedFavorites: [],
  updateCreatedFavorites: async (userMid: number | string) => {
    const favorites = await getAllCreatedFavorites(userMid);
    set(() => ({
      createdFavorites: favorites,
    }));
  },
  addCreatedFavorite: (favorite: FavoriteItem) =>
    set(state => ({
      createdFavorites: [favorite, ...state.createdFavorites],
    })),
  rmCreatedFavorite: (id: number) =>
    set(state => ({
      createdFavorites: state.createdFavorites.filter(item => item.id !== id),
    })),
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
  updateCollectedFavorites: async (userMid: number | string) => {
    const favorites = await getAllCollectedFavorites(userMid);
    set(() => ({
      collectedFavorites: favorites,
    }));
  },
  addCollectedFavorite: (favorite: FavoriteItem) =>
    set(state => ({
      collectedFavorites: [favorite, ...state.collectedFavorites],
    })),
  rmCollectedFavorite: (id: number) =>
    set(state => ({
      collectedFavorites: state.collectedFavorites.filter(item => item.id !== id),
    })),
}));

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
      favorites.push({
        id: item.id,
        title: item.title,
        cover: item.cover,
        type: item.type,
        mid: item.mid,
      });
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
      favorites.push({
        id: item.id,
        title: item.title,
        cover: item.cover,
        type: item.type,
        mid: item.mid,
      });
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
      favorites.push({
        id: item.id,
        title: item.title,
        cover: item.cover,
        type: item.type,
        mid: item.mid,
      });
    });
  });

  return favorites;
}
