import { create } from "zustand";

import { AlbumSublistData, getAlbumSublist } from "@/service/album-sublist";

interface State {
  albums: AlbumSublistData[] | null;
}

interface Action {
  updateFavoriteAlbums: () => Promise<void>;
}

export const useFavoriteAlbums = create<State & Action>(set => ({
  albums: null,
  updateFavoriteAlbums: async () => {
    const res = await getAlbumSublist({
      limit: 9999,
      offset: 0,
    });

    if (res?.data?.length) {
      set(() => ({ albums: res.data }));
    }
  },
}));
