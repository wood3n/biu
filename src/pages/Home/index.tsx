import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import request from '@/service/request';
import styles from './index.module.less';

const Home = () => {
  useEffect(() => {
    request.get('/search?keywords=海阔天空');
  }, []);

  return (
    <div className={styles.pageConatiner}>
      <Button variant="contained">主页</Button>
    </div>
  );
};

export default Home;
