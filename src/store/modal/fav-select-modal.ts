import type { ReactNode } from "react";

import type { StateCreator } from "zustand";

export interface FavSelectModalData {
  rid: string;
  title?: ReactNode;
  afterSubmit?: (ids: number[]) => void;
}

export interface FavSelectModalState {
  isFavSelectModalOpen: boolean;
  favSelectModalData: FavSelectModalData | null;
  onOpenFavSelectModal: (data: FavSelectModalData) => void;
  onFavSelectModalOpenChange: (isOpen: boolean) => void;
  onCloseFavSelectModal: () => void;
}

export const createFavSelectModalSlice: StateCreator<FavSelectModalState> = set => ({
  isFavSelectModalOpen: false,
  favSelectModalData: null,
  onOpenFavSelectModal: data => set({ isFavSelectModalOpen: true, favSelectModalData: data }),
  onFavSelectModalOpenChange: isOpen => set({ isFavSelectModalOpen: isOpen }),
  onCloseFavSelectModal: () => set({ isFavSelectModalOpen: false }),
});
