import { create } from "zustand";

import { type UserAcountStats } from "@/service/user-subcount";

interface UserState {
  stats: UserAcountStats | null;
}

interface Action {
  updateUserStats: (data: UserAcountStats) => void;
}

export const useUserStats = create<UserState & Action>(set => ({
  stats: null,
  updateUserStats: data => set(() => ({ stats: data })),
}));
