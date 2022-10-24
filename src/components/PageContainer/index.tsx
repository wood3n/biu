import React from 'react';
import ScrollHeader from '../ScrollHeader';
import styles from './index.module.less';

interface Props {
}

/**
 * 页面内容区域容器，具有吸顶顶栏
 */
const PageContainer: React.FC<Props> = (props) => {
  return (
    <div className={styles.pageContainer}>
      <ScrollHeader />
    </div>
  );
};

export default PageContainer;
