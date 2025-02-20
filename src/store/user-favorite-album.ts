import { create } from "zustand";

import { AlbumSublistData } from "@/service/album-sublist";

interface State {
  albums: AlbumSublistData[] | null;
}

interface Action {
  updateFavoriteAlbums: (data: AlbumSublistData[]) => void;
}

export const useFavoriteAlbums = create<State & Action>(set => ({
  albums: null,
  updateFavoriteAlbums: data => set(() => ({ albums: data })),
}));
