import { useContext } from 'react';
import { LoginContext } from '@/store/LoginProvider';

const useLogin = () => {
  return useContext(LoginContext);
};

export default useLogin;