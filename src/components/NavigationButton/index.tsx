import React from 'react';
import { Space, Button } from 'antd';
import { useNavigate, useMatch } from 'react-router-dom';
import classNames from 'classnames';
import {
  MdOutlineNavigateBefore,
  MdOutlineNavigateNext
} from 'react-icons/md';
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
      <a
        className={classNames(styles.navigationLink, { [styles.navigationLinkActive]: true })}
        onClick={() => navigate(-1)}
      >
        <MdOutlineNavigateBefore size={18} />
      </a>
      <a className={styles.navigationLink}>
        <MdOutlineNavigateNext size={18} />
      </a>
    </div>
  );
};

export default NavigationButton;
