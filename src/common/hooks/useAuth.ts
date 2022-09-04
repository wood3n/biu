import { useContext } from 'react';
import { AuthContext } from '@/state/AuthProvider';

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;