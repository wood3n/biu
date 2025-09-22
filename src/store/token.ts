import { create } from "zustand";

interface TokenInfo {
  refresh_token?: string;
  /** 毫秒 */
  timestamp?: number;
  url?: string;
  DedeUserID?: string;
  DedeUserID__ckMd5?: string;
  /** 秒，一般为半年的过期时间 */
  Expires?: number;
  SESSDATA?: string;
  bili_jct?: string;
  /** https://www.bilibili.com */
  gourl?: string;
  /** .bilibili.com */
  first_domain?: string;
}

interface TokenState {
  tokenData: TokenInfo | null;
}

interface Action {
  updateToken: (info: Partial<TokenInfo>) => void;
  clear: () => void;
}

export const useToken = create<TokenState & Action>(set => ({
  tokenData: null,
  updateToken: async (info: Partial<TokenInfo>) => {
    set(() => ({
      tokenData: {
        ...info,
      },
    }));
  },
  clear: () => {
    set(() => ({
      tokenData: null,
    }));
  },
}));
