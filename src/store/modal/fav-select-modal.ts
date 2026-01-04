import type { ReactNode } from "react";

import type { StateCreator } from "zustand";

export interface FavSelectModalData {
  /** 资源id */
  rid: string | number;
  /** 2:视频稿件 12:音频 21:视频合集 24:电影/纪录片等 */
  type?: number;
  title?: ReactNode;
  /** 选择收藏夹后的回调函数, selectedFolderIds 为选中的收藏夹id数组 */
  onSuccess?: (selectedFolderIds: number[]) => void;
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
