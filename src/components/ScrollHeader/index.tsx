import React from 'react';
import { Space } from 'antd';
import Search from '@/components/Search';
import NavigationButton from '@/components/NavigationButton';
import styles from './index.module.less';

/**
 * 系统内部区域顶栏
 */
const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <Space className={styles.headerLeft}>
        <NavigationButton />
        <Search />
      </Space>
      <div className={styles.headerRight}>

      </div>
    </div>
  );
};

export default Header;
