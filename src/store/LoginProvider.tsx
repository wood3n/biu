import React, { createContext, useState } from 'react';
import { getLogout } from '@/service';

interface AuthContextType {
  /**
   * 登录状态|用户账户信息
   */
  userAccount: API.UserAccount | null;
  update: (user: API.UserAccount) => void;
  logout: () => Promise<void>;
}

export const LoginContext = createContext<AuthContextType>({
  userAccount: null,
} as AuthContextType);

function LoginProvider({ children }: { children: React.ReactNode }) {
  const [userAccount, setUserAccount] = useState<API.UserAccount | null>(null);

  const update = (user: API.UserAccount) => {
    setUserAccount(user);
  };

  const logout = (cb?: VoidFunction) => getLogout().then(() => {
    setUserAccount(null);
    cb?.();
  });

  return (
    <LoginContext.Provider
      value={{
        userAccount,
        update,
        logout,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}

export default LoginProvider;