import { useContext } from 'react';
import { LoginContext } from '@/store/LoginProvider';

const useLogin = () => useContext(LoginContext);

export default useLogin;
