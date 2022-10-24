import React from 'react';
import { Space } from 'antd';
import Search from '@/components/Search';
import AvatarChip from '@/components/AvatarChip';
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
      <AvatarChip />
    </div>
  );
};

export default Header;
