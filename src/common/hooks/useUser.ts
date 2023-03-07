import { useContext } from 'react';
import { UserContext } from '@/store/UserProvider';

const useAuth = () => useContext(UserContext);

export default useAuth;
