import React from 'react';
import NavigationButton from '@/components/NavigationButton';
import Search from '@/components/Search';
import WindowCornerAction from '@/components/WindowCornerAction';
import styles from './index.module.less';

interface Props {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
}

/**
 * 页面内容区域容器，具有吸顶顶栏
 */
const PageContainer: React.FC<Props> = ({
  children,
  style,
  headerStyle
}) => {
  return (
    <div className={styles.pageContainer} style={style}>
      <div className={styles.pageHeader} style={headerStyle}>
        <div className={styles.headerLeft}>
          <NavigationButton />
          <Search />
        </div>
        <div className={styles.headerRight}>
          <WindowCornerAction />
        </div>
      </div>
      <div className={styles.pageContent}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
