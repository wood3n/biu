import { createContext, useEffect, useState } from 'react';
import { logout as reqLogout, getLoginStatus, getUserAccount, getUserProfile } from '@/service/api';

interface AuthContextType {
  user: API.User | null;
  refresh: (cookie: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<API.User | null>(null);

  const updateUser = async (id: number) => {
    const user = await getUserProfile(id);
    setUser(user);
  };

  const refresh = async (cookie: string) => {
    const { data } = await getLoginStatus(cookie);
    if (data?.profile?.userId) {
      updateUser(data.profile.userId);
    }
  };

  const checkLogin = async () => {
    const { profile } = await getUserAccount();
    if (profile?.userId) {
      updateUser(profile.userId);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => {
    console.log(user);
  });

  const logout = (cb?: VoidFunction) => {
    return reqLogout().then(() => {
      setUser(null);
      cb?.();
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        refresh,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;