import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import LoginIcon from '@mui/icons-material/Login';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/home')}>
      <LoginIcon />
      登录
    </Button>
  );
};

export default Login;
