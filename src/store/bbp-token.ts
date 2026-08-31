import { create } from "zustand";
import { persist } from "zustand/middleware";

import { StoreNameMap } from "@shared/store";

interface BBPAccountInfo {
  id: string;
  username: string;
  name: string;
  face: string | null;
}

interface BBPTokenState {
  token?: string;
  account?: BBPAccountInfo;
}

interface BBPTokenAction {
  setAuth: (token: string, account: BBPAccountInfo) => void;
  updateAccount: (account: Partial<BBPAccountInfo>) => void;
  clear: () => void;
}

export const useBBPTokenStore = create<BBPTokenState & BBPTokenAction>()(
  persist(
    set => ({
      token: undefined,
      account: undefined,
      setAuth: (token, account) =>
        set(() => ({
          token,
          account,
        })),
      updateAccount: account =>
        set(state => ({
          account: state.account ? { ...state.account, ...account } : undefined,
        })),
      clear: () =>
        set(() => ({
          token: undefined,
          account: undefined,
        })),
    }),
    {
      name: "bbp-token-store",
      partialize: state => ({
        token: state.token,
        account: state.account,
      }),
      storage: {
        getItem: async () => {
          const store = await window.electron.getStore(StoreNameMap.BBPAccount);

          return {
            state: store,
          };
        },

        setItem: async (_, value) => {
          if (value.state) {
            await window.electron.setStore(StoreNameMap.BBPAccount, value.state);
          }
        },

        removeItem: async () => {
          await window.electron.clearStore(StoreNameMap.BBPAccount);
        },
      },
    },
  ),
);
