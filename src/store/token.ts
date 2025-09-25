import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 从登录接口获取到的信息
 */
interface TokenInfo {
  refresh_token?: string;
  /** 毫秒 */
  timestamp?: number;
  url?: string;

  /** 以下数据从登录返回的 url 中解析出来 */
  DedeUserID?: string;
  DedeUserID__ckMd5?: string;
  /** 秒，一般为 180 的过期时间 */
  Expires?: number;
  /** 计算wbi签名需要 */
  SESSDATA?: string;
  /** csrf token，用于请求需要认证的接口，这个也存在于 cookie 中 */
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

export const useToken = create<TokenState & Action>()(
  persist(
    set => ({
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
    }),
    {
      name: "user-token",
      partialize: state => ({ tokenData: state.tokenData }),
    },
  ),
);
