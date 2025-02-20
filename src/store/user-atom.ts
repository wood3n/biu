import { atom, useAtom } from "jotai";

import type { UserDetail } from "@/service/user-detail";
import type { UserAcountStats } from "@/service/user-subcount";

interface User {
  userInfo: UserDetail | null;
  userAccountStats: UserAcountStats | null;
}

/**
 * 当前登录用户状态
 */
export const userAtom = atom<User | null>(null);

const useUser = () => useAtom(userAtom);

export default useUser;
