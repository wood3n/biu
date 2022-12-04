import { useContext } from 'react';
import { UserContext } from '@/store/UserProvider';

const useAuth = () => {
  return useContext(UserContext);
};

export default useAuth;