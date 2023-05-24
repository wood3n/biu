import React from 'react';
import {
  MdOutlineFullscreenExit,
  MdOutlineFullscreen,
  MdClose,
  MdRemove,
} from 'react-icons/md';
import styles from './index.module.less';

/**
 * 窗口关闭等按钮操作
 */
const WindowAction: React.FC = () => (
  <span className={styles.windowAction}>
    <a className={styles.minimize}>
      <MdRemove size={18} />
    </a>
    <a className={styles.resize}>
      <MdOutlineFullscreen size={18} />
    </a>
    <a className={styles.close}>
      <MdClose size={18} />
    </a>
  </span>
);

export default WindowAction;
