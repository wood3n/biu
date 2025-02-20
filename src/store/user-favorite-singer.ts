import { create } from "zustand";

import { ArtistSublistData } from "@/service/artist-sublist";

interface State {
  singers: ArtistSublistData[] | null;
}

interface Action {
  updateFavoriteSingers: (data: ArtistSublistData[]) => void;
}

export const useFavoriteSinger = create<State & Action>(set => ({
  singers: null,
  updateFavoriteSingers: data => set(() => ({ singers: data })),
}));
