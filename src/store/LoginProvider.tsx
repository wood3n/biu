import React, { createContext, useState } from 'react';
import { getLogout } from '@/service';
import type { LoginStatus } from '@/service/login-status';

interface AuthContextType {
  /**
   * 登录状态|用户账户信息
   */
  userAccount: LoginStatus | null;
  update: (user: LoginStatus) => void;
  logout: () => Promise<void>;
}

export const LoginContext = createContext<AuthContextType>({
  userAccount: null,
} as AuthContextType);

function LoginProvider({ children }: { children: React.ReactNode }) {
  const [userAccount, setUserAccount] = useState<LoginStatus | null>(null);

  const update = (user: LoginStatus) => {
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
