import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import useAuth from '@/common/hooks/useAuth';

const BasicLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default BasicLayout;
