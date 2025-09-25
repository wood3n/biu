import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getFavFolderCollectedList, type FavFolderCollectedItem } from "@/service/fav-folder-collected-list";
import { getFavFolderCreatedListAll, type FavFolderItem } from "@/service/fav-folder-created-list-all";
import { getUserInfo, type UserInfo } from "@/service/user-info";

interface UserState {
  user: UserInfo | null;
  ownFolder: FavFolderItem[];
  otherFolder: FavFolderCollectedItem[];
}

interface Action {
  updateUser: () => void;
  updateOwnFolder: () => void;
  clear: () => void;
}

export const useUser = create<UserState & Action>()(
  persist(
    (set, get) => ({
      user: null,
      getUser: () => get().user,
      ownFolder: [],
      otherFolder: [],
      updateUser: async () => {
        const res = await getUserInfo();

        if (res.code === 0 && res.data?.isLogin) {
          set(() => ({ user: res.data }));

          const result = await Promise.allSettled([
            getFavFolderCreatedListAll({
              up_mid: res.data?.mid ?? 0,
            }),
            getFavFolderCollectedList({
              up_mid: res.data?.mid ?? 0,
              ps: 999,
              pn: 1,
            }),
          ]);

          const getOwnFolderRes = result[0];
          const getOtherFolderRes = result[1];

          set(() => ({
            ownFolder: getOwnFolderRes?.status === "fulfilled" ? (getOwnFolderRes.value?.data?.list ?? []) : [],
            otherFolder: getOtherFolderRes?.status === "fulfilled" ? (getOtherFolderRes.value?.data?.list ?? []) : [],
          }));
        } else {
          set(() => ({ user: null }));
        }
      },
      updateOwnFolder: async () => {
        const user = get().user;

        if (!user) {
          return;
        }

        const res = await getFavFolderCreatedListAll({
          up_mid: user.mid,
        });

        if (res.code === 0) {
          set(() => ({ ownFolder: res.data?.list ?? [] }));
        }
      },
      clear: () => {
        set(() => ({ user: null, ownFolder: [], otherFolder: [] }));
      },
    }),
    {
      name: "user",
      partialize: state => ({ user: state.user }),
    },
  ),
);
