import React, { useRef, useState, useEffect } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { type TooltipProps } from '@mui/material/Tooltip';

const OverflowText = ({ children, ...props }: React.PropsWithChildren<Omit<TooltipProps, 'children'>>) => {
  const [isOverflowed, setIsOverflow] = useState(false);
  const textElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOverflow(textElementRef.current!.scrollWidth > textElementRef.current!.clientWidth);
  }, []);

  return (
    <Tooltip
      disableHoverListener={!isOverflowed}
      {...props}
      // 禁止在 root 下面创建节点，可能会显示非预期的滚动条
      PopperProps={{
        disablePortal: true,
      }}
    >
      <Typography
        ref={textElementRef}
        noWrap
      >
        {children}
      </Typography>
    </Tooltip>
  );
};

export default OverflowText;
