import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getFavFolderCollectedList, type FavFolderCollectedItem } from "@/service/fav-folder-collected-list";
import { getFavFolderCreatedListAll, type FavFolderItem } from "@/service/fav-folder-created-list-all";
import { getUserInfo, type UserInfo } from "@/service/user-info";

interface UserState {
  user: UserInfo | null;
  ownFolder: FavFolderItem[];
  collectedFolder: FavFolderCollectedItem[];
}

interface Action {
  updateUser: () => Promise<void>;
  updateOwnFolder: () => Promise<void>;
  updateCollectedFolder: () => Promise<void>;
  clear: () => void;
}

export const useUser = create<UserState & Action>()(
  persist(
    (set, get) => ({
      user: null,
      ownFolder: [],
      collectedFolder: [],
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
              platform: "web",
            }),
          ]);

          const getOwnFolderRes = result[0];
          const getOtherFolderRes = result[1];

          set(() => ({
            ownFolder: getOwnFolderRes?.status === "fulfilled" ? (getOwnFolderRes.value?.data?.list ?? []) : [],
            collectedFolder:
              getOtherFolderRes?.status === "fulfilled" ? (getOtherFolderRes.value?.data?.list ?? []) : [],
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
      updateCollectedFolder: async () => {
        const user = get().user;

        if (!user) {
          return;
        }

        const res = await getFavFolderCollectedList({
          up_mid: user.mid,
          ps: 999,
          pn: 1,
          platform: "web",
        });

        if (res.code === 0) {
          set(() => ({ collectedFolder: res.data?.list ?? [] }));
        }
      },
      clear: () => {
        set(() => ({ user: null, ownFolder: [], collectedFolder: [] }));
      },
    }),
    {
      name: "user",
      partialize: state => ({ user: state.user }),
    },
  ),
);
