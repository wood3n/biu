import { createContext, useState } from 'react';
import { logout as reqLogout } from '@/service/api';

interface AuthContextType {
  user: API.UserStatus | null;
  update: (user: API.UserStatus) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<API.UserStatus | null>(null);

  const update = (user: API.UserStatus) => {
    setUser(user);
  };

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
        update,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;