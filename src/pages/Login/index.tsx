import React from 'react';
import { Row, Col } from 'antd';
import WindowCornerAction from '@/components/window-action';
import { ReactComponent as Music } from '@/assets/images/music.svg';
import LoginByQr from './LoginByQr';
import styles from './index.module.less';

const Login: React.FC = () => (
  <Row className={styles.login}>
    <Col span={16} className={styles.loginSider} />
    <Col span={8}>
      <div className={styles.winAction}>
        <WindowCornerAction />
      </div>
      <div className={styles.loginForm}>
        <div className={styles.logo}>
          <span><Music width={48} height={48} /></span>
        </div>
        <LoginByQr />
      </div>
    </Col>
  </Row>
);

export default Login;
