import { create } from "zustand";

import { type UserInfo } from "@/service/user-info";

interface UserState {
  user: UserInfo | null;
}

interface Action {
  updateUser: (userId: UserInfo) => void;
}

export const useUser = create<UserState & Action>(set => ({
  user: null,
  updateUser: userInfo => {
    set(() => ({ user: userInfo }));
  },
}));
