import React, { useState, createContext, useMemo } from 'react';
import type { UserDetail } from '@/service/user-detail';
import type { UserAcountStats } from '@/service/user-subcount';

interface User {
  userInfo: UserDetail | null;
  userAccountStats: UserAcountStats | null;
}

interface ContextType {
  user: User | null;
  update: (user: User) => void;
}

export const UserContext = createContext<ContextType>({
  user: null,
} as ContextType);

/**
 * 用户详情信息
 */
const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const memoValue = useMemo(() => ({
    user,
    update: (v: User) => setUser(v),
  }), [user]);

  return (
    <UserContext.Provider value={memoValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
