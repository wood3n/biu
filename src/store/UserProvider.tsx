import React, { useState, createContext } from 'react';

interface User {
  userInfo: API.UserDetail | null;
  userAccountStats: API.UserAcountStats | null;
}

interface ContextType {
  user: User | null;
  update: (user: User) => void;
}

export const UserContext = createContext<ContextType>({
  user: null
} as ContextType);

/**
 * 用户详情信息
 */
const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, update: (user: User) => setUser(user) }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
