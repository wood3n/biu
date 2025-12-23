import type { ReactNode } from "react";

import type { StateCreator } from "zustand";

export interface ConfirmModalData {
  title: ReactNode;
  description?: ReactNode;
  onConfirm: () => Promise<boolean>;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger";
}

export interface ConfirmModalState {
  isConfirmModalOpen: boolean;
  onConfirmModalOpenChange: (isOpen: boolean) => void;
  confirmModalData: ConfirmModalData | null;
  onOpenConfirmModal: (data: ConfirmModalData) => void;
  onCloseConfirmModal: () => void;
}

export const createConfirmModalSlice: StateCreator<ConfirmModalState> = set => ({
  isConfirmModalOpen: false,
  onConfirmModalOpenChange: isOpen => set({ isConfirmModalOpen: isOpen }),
  confirmModalData: null,
  onOpenConfirmModal: data => set({ isConfirmModalOpen: true, confirmModalData: data }),
  onCloseConfirmModal: () => set({ isConfirmModalOpen: false }),
});
