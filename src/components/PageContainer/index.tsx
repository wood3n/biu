import React from 'react';
import ScrollHeader from '../ScrollHeader';
import styles from './index.module.less';

interface Props {
  children?: React.ReactNode;
}

/**
 * 页面内容区域容器，具有吸顶顶栏
 */
const PageContainer: React.FC<Props> = ({
  children
}) => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <ScrollHeader />
      </div>
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
