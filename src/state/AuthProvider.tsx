import { createContext, useState } from 'react';
import { login as reqLogin, logout as reqLogout } from '@/service/api';

interface SignIn {
  (user: API.PhoneLoginData, cb: VoidFunction): Promise<void>;
}

interface AuthContextType {
  user: API.User | null;
  login: SignIn;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<API.User | null>(null);

  const login: SignIn = (data: API.PhoneLoginData, cb?: VoidFunction) => {
    return reqLogin(data).then((user) => {
      // @ts-expect-error ts(2345)
      setUser(user);
      cb?.();
    });
  };

  const logout = (callback?: VoidFunction) => {
    return reqLogout().then(callback);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export default AuthProvider;