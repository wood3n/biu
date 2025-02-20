import { create } from "zustand";

import { getUserDetail, type UserDetail } from "@/service/user-detail";

interface UserState {
  user: UserDetail | null;
}

interface Action {
  updateUser: (userId: number) => Promise<void>;
}

export const useUser = create<UserState & Action>(set => ({
  user: null,
  updateUser: async userId => {
    const user = await getUserDetail({
      uid: userId,
    });

    set(() => ({ user }));
  },
}));
