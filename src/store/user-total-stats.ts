import { create } from "zustand";

import { HttpResponse } from "@/common/constants";
import { getUserSubcount, type UserAcountStats } from "@/service/user-subcount";

interface UserState {
  stats: UserAcountStats | null;
}

interface Action {
  updateUserStats: () => Promise<void>;
}

export const useUserStats = create<UserState & Action>(set => ({
  stats: null,
  updateUserStats: async () => {
    const res = await getUserSubcount();

    if (res.code === HttpResponse.Success) set({ stats: res });
  },
}));
