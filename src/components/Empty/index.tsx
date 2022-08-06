import React from 'react';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import styles from './index.less';

interface Props {
  text?: string;
}

const Empty: React.FC<Props> = ({ text }) => {
  return (
    <div className={styles.empty}>
      <HeadphonesIcon />
      <span>{text ?? '暂无内容'}</span>
    </div>
  );
};

export default React.memo(Empty);
