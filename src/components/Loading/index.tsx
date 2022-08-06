import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

interface Props {
  text?: string;
}

/**
 * 页面加载状态
 */
const Loading: React.FC<Props> = ({ text }) => {
  return (
    <div>
      <CircularProgress />
      {text}
    </div>
  );
};

Loading.defaultProps = {
  text: '加载中',
};

export default React.memo(Loading);
