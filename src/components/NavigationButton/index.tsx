import React from 'react';
import { Space, Button } from 'antd';
import { useNavigate, useMatch } from 'react-router-dom';
import classNames from 'classnames';
import { ReactComponent as IconLeft } from '@/assets/icons/left.svg';
import { ReactComponent as IconRight } from '@/assets/icons/right.svg';
import styles from './index.module.less';

interface Props {
}

/**
 * 导航按钮
 */
const NavigationButton: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  console.log(window.history.length);


  return (
    <div className={styles.navigations}>
      <a className={classNames(styles.navigationLink, { [styles.navigationLinkActive]: true })}>
        <IconLeft width={18} height={18} style={{ marginLeft: -2 }} onClick={() => navigate(-1)}/>
      </a>
      <a className={styles.navigationLink}>
        <IconRight width={18} height={18} style={{ marginLeft: 2 }} />
      </a>
    </div>
  );
};

export default NavigationButton;
