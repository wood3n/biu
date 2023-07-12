import React from 'react';
import LoginByQr from './login-qr';
import styles from './index.module.less';

const Login: React.FC = () => (
  <div className={styles.login}>
    <LoginByQr />
  </div>
);

export default Login;
