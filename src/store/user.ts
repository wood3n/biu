import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getFavFolderCollectedList, type FavFolderCollectedItem } from "@/service/fav-folder-collected-list";
import { getFavFolderCreatedListAll, type FavFolderItem } from "@/service/fav-folder-created-list-all";
import { getUserInfo, type UserInfo } from "@/service/user-info";

interface UserState {
  user: UserInfo | null;
  ownFolder: FavFolderItem[];
  collectedFolder: FavFolderCollectedItem[];
  collectedFolderPn: number;
  collectedFolderHasMore: boolean;
  collectedFolderTotal: number;
}

interface Action {
  updateUser: () => Promise<void>;
  updateOwnFolder: () => Promise<void>;
  updateCollectedFolder: (append?: boolean) => Promise<void>;
  loadMoreCollectedFolder: () => Promise<void>;
  clear: () => void;
}
export const useUser = create<UserState & Action>()(
  persist(
    (set, get) => ({
      user: null,
      ownFolder: [],
      collectedFolder: [],
      collectedFolderPn: 1,
      collectedFolderHasMore: false,
      collectedFolderTotal: 0,
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
              ps: 50,
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
            collectedFolderPn: 1,
            collectedFolderHasMore:
              getOtherFolderRes?.status === "fulfilled" ? (getOtherFolderRes.value?.data?.has_more ?? false) : false,
            collectedFolderTotal:
              getOtherFolderRes?.status === "fulfilled" ? (getOtherFolderRes.value?.data?.count ?? 0) : 0,
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
      updateCollectedFolder: async (append = false) => {
        const user = get().user;

        if (!user) {
          return;
        }

        const currentPn = append ? get().collectedFolderPn + 1 : 1;

        const res = await getFavFolderCollectedList({
          up_mid: user.mid,
          ps: 50,
          pn: currentPn,
          platform: "web",
        });

        if (res.code === 0) {
          set(state => ({
            collectedFolder: append ? [...state.collectedFolder, ...(res.data?.list ?? [])] : (res.data?.list ?? []),
            collectedFolderPn: currentPn,
            collectedFolderHasMore: res.data?.has_more ?? false,
            collectedFolderTotal: res.data?.count ?? 0,
          }));
        }
      },
      loadMoreCollectedFolder: async () => {
        await get().updateCollectedFolder(true);
      },
      clear: () => {
        set(() => ({
          user: null,
          ownFolder: [],
          collectedFolder: [],
          collectedFolderPn: 1,
          collectedFolderHasMore: false,
          collectedFolderTotal: 0,
        }));
      },
    }),
    {
      name: "user",
      partialize: state => state.user,
      storage: {
        getItem: async () => {
          const store = await window.electron.getStore<UserInfo>("user-login-info");

          return {
            state: store,
          };
        },

        setItem: async (_, value) => {
          await window.electron.setStore("user-login-info", value.state);
        },

        removeItem: async () => {
          await window.electron.clearStore("user-login-info");
        },
      },
    },
  ),
);
