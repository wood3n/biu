import React, { useEffect } from 'react';
import NavigationButton from '@/components/navigation';
import Search from '@/components/search';
import WindowCornerAction from '@/components/window-action';
import styles from './index.module.less';

interface Props {
  loading?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  headerStickyColor?: string;
  headerStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

/**
 * 页面内容区域容器，具有吸顶顶栏
 */
const PageContainer: React.FC<Props> = ({
  loading,
  children,
  style,
  headerStickyColor = '#121212',
  headerStyle,
  contentStyle,
}) => {
  useEffect(() => {
    const header = document.querySelector('#stickyHeader') as HTMLDivElement;
    const observerTarget = document.querySelector('#sticky-observer-target');
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) {
        header.style.boxShadow = '0 1px 6px 0 rgb(0 0 0 / 20%)';
        header.style.background = headerStickyColor;
      } else {
        header.style.boxShadow = 'none';
        header.style.background = 'none';
      }
    }, {
      root: document.querySelector('.sticky-content-container'),
    });

    if (observerTarget) {
      observer.observe(observerTarget);
    }
  }, []);

  return (
    <div className={styles.pageContainer} style={style}>
      <div id="stickyHeader" className={styles.pageHeader} style={headerStyle}>
        <div className={styles.headerLeft}>
          <NavigationButton />
          <Search />
        </div>
        <div className={styles.headerRight}>
          <WindowCornerAction />
        </div>
      </div>
      <div className={styles.stickyObTarget} id="sticky-observer-target" />
      <div className={styles.pageContent} style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
